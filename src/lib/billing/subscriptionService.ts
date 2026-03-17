import { createSupabaseAdminClient } from "@/lib/supabase/serverAdmin";
import { normalizePlan, type Plan } from "./plans";

export async function getPlanForUser(userId: string): Promise<Plan> {
	const supabase = createSupabaseAdminClient();
	// Prefer explicit users.plan (kept in sync by webhook), fallback to subscriptions table.
	const { data: userRow } = await supabase
		.from("users")
		.select("plan")
		.eq("id", userId)
		.maybeSingle();
	const planFromUser = normalizePlan(userRow?.plan);
	if (planFromUser === "pro") return "pro";

	const { data: subRow } = await supabase
		.from("subscriptions")
		.select("plan,status,current_period_end")
		.eq("user_id", userId)
		.order("created_at", { ascending: false })
		.limit(1)
		.maybeSingle();

	if (subRow && subRow.status === "active") return normalizePlan(subRow.plan);
	return "free";
}
