import { NextResponse } from "next/server";
import { requireAuthedUser } from "@/lib/supabase/getUserFromRequest";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdmin";
import { getAppUrl, getStripeClient } from "@/lib/billing/stripe";

export async function POST() {
	try {
		const authed = await requireAuthedUser();
		const supabase = createSupabaseAdminClient();
		const { data: subRow, error } = await supabase
			.from("subscriptions")
			.select("stripe_customer_id")
			.eq("user_id", authed.id)
			.order("created_at", { ascending: false })
			.limit(1)
			.maybeSingle();
		if (error) throw error;
		const customerId = subRow?.stripe_customer_id;
		if (!customerId) throw new Error("No Stripe customer found for this account");

		const stripe = getStripeClient();
		const session = await stripe.billingPortal.sessions.create({
			customer: customerId,
			return_url: `${getAppUrl()}/settings/billing`,
		});

		await supabase.from("audit_events").insert({
			user_id: authed.id,
			event_type: "billing.portal.created",
			payload: { stripe_customer_id: customerId },
		});

		return NextResponse.json({ url: session.url });
	} catch (e: unknown) {
		return NextResponse.json(
			{ error: e instanceof Error ? e.message : "Failed to create portal session" },
			{ status: 400 }
		);
	}
}
