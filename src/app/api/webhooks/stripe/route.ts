import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdmin";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/billing/stripe";

export async function POST(req: Request) {
	try {
		const sig = (await headers()).get("stripe-signature");
		if (!sig) return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });

		const body = await req.text();
		const stripe = getStripeClient();
		const secret = getStripeWebhookSecret();
		const event = stripe.webhooks.constructEvent(body, sig, secret);

		const supabase = createSupabaseAdminClient();

		// Idempotency: ignore duplicate deliveries.
		{
			const { error } = await supabase
				.from("stripe_events")
				.insert({ id: event.id, type: event.type });
			if (error) {
				const msg = String((error as { message?: string }).message ?? "");
				if (msg.toLowerCase().includes("duplicate")) {
					return NextResponse.json({ received: true, deduped: true });
				}
				throw error;
			}
		}

		// Best-effort audit log.
		await supabase.from("audit_events").insert({
			event_type: `stripe.${event.type}`,
			payload: {
				id: event.id,
				type: event.type,
				created: event.created,
				livemode: event.livemode,
			},
		});

		if (event.type === "checkout.session.completed") {
			const session = event.data.object as unknown as {
				customer: string | null;
				subscription: string | null;
				client_reference_id: string | null;
				metadata?: Record<string, string>;
			};
			const userId = session.client_reference_id || session.metadata?.user_id;
			if (userId) {
				await supabase.from("subscriptions").upsert({
					user_id: userId,
					plan: "pro",
					status: "active",
					stripe_customer_id: session.customer,
					stripe_subscription_id: session.subscription,
				}, { onConflict: "stripe_subscription_id" });
				await supabase.from("users").update({ plan: "pro" }).eq("id", userId);
			}
		}

		if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
			const sub = event.data.object as unknown as {
				id: string;
				customer: string | null;
				status: string;
				current_period_end: number | null;
				metadata?: Record<string, string>;
			};

			let userId = sub.metadata?.user_id;
			if (!userId && sub.customer) {
				const { data } = await supabase
					.from("subscriptions")
					.select("user_id")
					.eq("stripe_customer_id", sub.customer)
					.order("created_at", { ascending: false })
					.limit(1)
					.maybeSingle();
				userId = data?.user_id ?? null;
			}

			if (userId) {
				await supabase
					.from("subscriptions")
					.upsert(
						{
							user_id: userId,
							plan: "pro",
							status: sub.status,
							stripe_customer_id: sub.customer,
							stripe_subscription_id: sub.id,
							current_period_end: sub.current_period_end
								? new Date(sub.current_period_end * 1000).toISOString()
								: null,
						},
						{ onConflict: "stripe_subscription_id" }
					)
					.eq("stripe_subscription_id", sub.id);

				const isActive = sub.status === "active" || sub.status === "trialing";
				await supabase
					.from("users")
					.update({ plan: isActive ? "pro" : "free" })
					.eq("id", userId);
			}
		}

		if (event.type === "invoice.payment_succeeded" || event.type === "invoice.payment_failed") {
			const invoice = event.data.object as unknown as {
				customer: string | null;
				subscription: string | null;
				status?: string;
				paid?: boolean;
				attempt_count?: number;
			};

			// Try to locate user by subscription id first, then customer id.
			let userId: string | null = null;
			if (invoice.subscription) {
				const { data } = await supabase
					.from("subscriptions")
					.select("user_id")
					.eq("stripe_subscription_id", invoice.subscription)
					.maybeSingle();
				userId = data?.user_id ?? null;
			}
			if (!userId && invoice.customer) {
				const { data } = await supabase
					.from("subscriptions")
					.select("user_id")
					.eq("stripe_customer_id", invoice.customer)
					.order("created_at", { ascending: false })
					.limit(1)
					.maybeSingle();
				userId = data?.user_id ?? null;
			}

			if (userId) {
				await supabase.from("audit_events").insert({
					user_id: userId,
					event_type: `billing.${event.type}`,
					payload: {
						customer: invoice.customer,
						subscription: invoice.subscription,
						status: invoice.status,
						paid: invoice.paid,
						attempt_count: invoice.attempt_count,
					},
				});
			}
		}

		return NextResponse.json({ received: true });
	} catch (e: unknown) {
		return NextResponse.json(
			{ error: e instanceof Error ? e.message : "Webhook error" },
			{ status: 400 }
		);
	}
}
