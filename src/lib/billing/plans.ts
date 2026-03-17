export type Plan = "free" | "pro";

export const PLAN_LIMITS: Record<Plan, { dailySuccessfulGenerations: number }> = {
	free: { dailySuccessfulGenerations: 10 },
	pro: { dailySuccessfulGenerations: 1000 },
};

export function normalizePlan(p: unknown): Plan {
	return p === "pro" ? "pro" : "free";
}
