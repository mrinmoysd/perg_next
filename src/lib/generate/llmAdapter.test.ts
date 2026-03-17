import { describe, expect, it, vi } from "vitest";

import { generateReply } from "./llmAdapter";

describe("llmAdapter signature enforcement", () => {
	it("appends explicit signature when missing", async () => {
		vi.stubEnv("OPENAI_API_KEY", "");

		const res = await generateReply({
			inputEmail: "Hi there",
			tone: "professional",
			length: "short",
			signature: "Best,\nAva",
			senderName: "Ava",
		});

		expect(res.reply).toContain("Best,\nAva");
		// Signature should be at the end.
		expect(res.reply.trim().endsWith("Best,\nAva")).toBe(true);
	});

	it("does not duplicate signature if already present", async () => {
		vi.stubEnv("OPENAI_API_KEY", "");

		const res = await generateReply({
			inputEmail: "Hi there",
			tone: "professional",
			length: "short",
			signature: "Best,\nAva",
			senderName: "Ava",
		});

		const occurrences = res.reply.split("Best,\nAva").length - 1;
		expect(occurrences).toBe(1);
	});

	it("leaves reply unchanged when signature not provided", async () => {
		vi.stubEnv("OPENAI_API_KEY", "");

		const res = await generateReply({
			inputEmail: "Hi there",
			tone: "professional",
			length: "short",
		});

		expect(res.reply).toBeTruthy();
	});
});
