import { describe, expect, it } from "vitest";
import { buildReplyPrompt } from "./promptBuilder";

describe("buildReplyPrompt", () => {
	it("includes input email and constraints", () => {
		const prompt = buildReplyPrompt({
			inputEmail: "Hello, can we meet tomorrow?",
			tone: "professional",
			length: "short",
		});
		expect(prompt).toContain("Email:");
		expect(prompt).toContain("Hello, can we meet tomorrow?");
		expect(prompt).toContain("Tone: professional");
		expect(prompt).toContain("Length: short");
	});

	it("prefers explicit signature", () => {
		const prompt = buildReplyPrompt({
			inputEmail: "Thanks for the update.",
			tone: "friendly",
			length: "short",
			signature: "Best,\nTanmoy",
			senderName: "Ignored",
		});
		expect(prompt).toContain("Sign as: Best,\nTanmoy");
	});

	it("throws when inputEmail is empty", () => {
		expect(() =>
			buildReplyPrompt({
				inputEmail: "   ",
				tone: "friendly",
				length: "medium",
			})
		).toThrow(/inputEmail is required/);
	});
});
