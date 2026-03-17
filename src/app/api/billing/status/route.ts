import { NextResponse } from "next/server";
import { requireAuthedUser } from "@/lib/supabase/getUserFromRequest";
import { getPlanForUser } from "@/lib/billing/subscriptionService";
import { canGenerate } from "@/lib/billing/quotaService";

export async function GET() {
	try {
		const authed = await requireAuthedUser();
		const plan = await getPlanForUser(authed.id);
		const quota = await canGenerate(authed.id, plan);
		return NextResponse.json({ plan, quota });
	} catch (e: unknown) {
		return NextResponse.json(
			{ error: e instanceof Error ? e.message : "Unauthorized" },
			{ status: 401 }
		);
	}
}
