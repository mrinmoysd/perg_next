import { createSupabaseAdminClient } from "@/lib/supabase/serverAdmin";
import { PLAN_LIMITS, type Plan } from "./plans";

export type QuotaCheckResult =
	| { allowed: true; remaining: number; limit: number; used: number; day: string }
	| { allowed: false; remaining: 0; limit: number; used: number; day: string };

function todayUtcDate(): { day: string; date: Date } {
	const now = new Date();
	const y = now.getUTCFullYear();
	const m = now.getUTCMonth();
	const d = now.getUTCDate();
	const date = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
	const day = date.toISOString().slice(0, 10);
	return { day, date };
}

export async function canGenerate(userId: string, plan: Plan): Promise<QuotaCheckResult> {
	const { day } = todayUtcDate();
	const limit = PLAN_LIMITS[plan].dailySuccessfulGenerations;
	const supabase = createSupabaseAdminClient();
	const { data } = await supabase
		.from("usage_counters")
		.select("successful_generations")
		.eq("user_id", userId)
		.eq("day", day)
		.maybeSingle();
	const used = typeof data?.successful_generations === "number" ? data.successful_generations : 0;
	const remaining = Math.max(0, limit - used);
	if (remaining <= 0) return { allowed: false, remaining: 0, limit, used, day };
	return { allowed: true, remaining, limit, used, day };
}

export async function incrementSuccess(userId: string): Promise<void> {
	const { day } = todayUtcDate();
	const supabase = createSupabaseAdminClient();

	// Atomic increment:
	// 1) Ensure row exists
	// 2) Atomically increment using a single SQL update (server-side)
	//
	// Supabase JS doesn't currently expose `increment` helpers for PostgREST in a
	// way that guarantees atomicity across concurrent requests, so we use an RPC
	// function when available.
	const { error } = await supabase.rpc("increment_usage_success", {
		p_user_id: userId,
		p_day: day,
	});
	if (error) throw error;
}
