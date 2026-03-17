import { describe, expect, it } from "vitest";
import { normalizePlan, PLAN_LIMITS } from "./plans";

describe("billing plans", () => {
	it("normalizes plan", () => {
		expect(normalizePlan("pro")).toBe("pro");
		expect(normalizePlan("free")).toBe("free");
		expect(normalizePlan("anything")).toBe("free");
	});

	it("has reasonable limits", () => {
		expect(PLAN_LIMITS.free.dailySuccessfulGenerations).toBeGreaterThan(0);
		expect(PLAN_LIMITS.pro.dailySuccessfulGenerations).toBeGreaterThan(
			PLAN_LIMITS.free.dailySuccessfulGenerations
		);
	});
});
