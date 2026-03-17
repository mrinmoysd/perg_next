import type { GenerateRequest } from "./types";
import { buildReplyPrompt } from "./promptBuilder";

export type LlmResult = {
	reply: string;
	model: string;
};

function normalizeSignature(sig: string): string {
	// Keep signature as-is (user-controlled), just trim outer whitespace.
	return sig.trim();
}

function ensureSignature(reply: string, signature?: string): string {
	const r = (reply ?? "").trim();
	const sig = signature ? normalizeSignature(signature) : "";
	if (!r || !sig) return r;

	// Very small heuristic: if the signature text already appears at the end, don't duplicate it.
	const normalizedReplyEnd = r.slice(Math.max(0, r.length - (sig.length + 10))).toLowerCase();
	if (normalizedReplyEnd.includes(sig.toLowerCase())) return r;

	return `${r}\n\n${sig}`;
}

function mockGenerate(req: GenerateRequest): LlmResult {
	const name = (req.senderName ?? "").trim();
	const signOff = name ? `\n\nBest,\n${name}` : "";

	const tonePrefix: Record<GenerateRequest["tone"], string> = {
		professional: "Thanks for reaching out.",
		friendly: "Thanks so much for your message!",
		direct: "Thanks—understood.",
		empathetic: "Thanks for sharing this—I understand.",
	};

	const lengthBody: Record<GenerateRequest["length"], string> = {
		short: "\n\nI can help. Could you confirm your preferred timeline and any key constraints?",
		medium:
			"\n\nI can help with this. To make sure I respond correctly, could you confirm your preferred timeline and any specific constraints or requirements? Once I have that, I’ll follow up with the next steps.",
		long:
			"\n\nI can help with this. To make sure I respond correctly, could you confirm:\n- your preferred timeline\n- any key constraints or requirements\n- who else should be involved\n\nOnce I have that, I’ll propose a clear set of next steps and options.",
	};

	return {
		reply: ensureSignature(`${tonePrefix[req.tone]}${lengthBody[req.length]}${signOff}`, req.signature),
		model: "mock",
	};
}

async function openAiGenerate(req: GenerateRequest): Promise<LlmResult> {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) return mockGenerate(req);

	const prompt = buildReplyPrompt(req);
	const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

	try {
		const res = await fetch("https://api.openai.com/v1/responses", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model,
				input: [
					{ role: "user", content: [{ type: "input_text", text: prompt }] },
				],
			}),
		});

		if (!res.ok) return mockGenerate(req);
		const json: unknown = await res.json();
		const j = (json && typeof json === "object") ? (json as Record<string, unknown>) : {};
		const outputText = typeof j.output_text === "string" ? j.output_text : undefined;
		let text: string | undefined = outputText;

		if (!text) {
			const output = Array.isArray(j.output) ? (j.output as unknown[]) : [];
			const first = (output[0] && typeof output[0] === "object") ? (output[0] as Record<string, unknown>) : undefined;
			const content = first && Array.isArray(first.content) ? (first.content as unknown[]) : [];
			const outputTextItem = content.find((c) => {
				if (!c || typeof c !== "object") return false;
				return (c as Record<string, unknown>).type === "output_text";
			});
			if (outputTextItem && typeof outputTextItem === "object") {
				const item = outputTextItem as Record<string, unknown>;
				text = typeof item.text === "string" ? item.text : undefined;
			}
		}

		const reply = typeof text === "string" ? text.trim() : "";
		if (!reply) return mockGenerate(req);

		return { reply: ensureSignature(reply, req.signature), model };
	} catch {
		return mockGenerate(req);
	}
}

export async function generateReply(req: GenerateRequest): Promise<LlmResult> {
	return openAiGenerate(req);
}
