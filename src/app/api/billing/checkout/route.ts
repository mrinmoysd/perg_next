import { NextResponse } from "next/server";
import { requireAuthedUser } from "@/lib/supabase/getUserFromRequest";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdmin";
import { getStripeClient, getAppUrl } from "@/lib/billing/stripe";

export async function POST() {
	try {
		const authed = await requireAuthedUser();
		const supabase = createSupabaseAdminClient();
		const { data: userRow } = await supabase
			.from("users")
			.select("email")
			.eq("id", authed.id)
			.maybeSingle();

		const stripe = getStripeClient();
		const priceId = process.env.STRIPE_PRO_PRICE_ID;
		if (!priceId) throw new Error("Missing env var: STRIPE_PRO_PRICE_ID");

		const session = await stripe.checkout.sessions.create({
			mode: "subscription",
			line_items: [{ price: priceId, quantity: 1 }],
			success_url: `${getAppUrl()}/settings/billing?success=1`,
			cancel_url: `${getAppUrl()}/settings/billing?canceled=1`,
			client_reference_id: authed.id,
			customer_email: userRow?.email ?? authed.email ?? undefined,
			metadata: {
				user_id: authed.id,
			},
		});

		return NextResponse.json({ url: session.url });
	} catch (e: unknown) {
		return NextResponse.json(
			{ error: e instanceof Error ? e.message : "Failed to create checkout session" },
			{ status: 400 }
		);
	}
}
