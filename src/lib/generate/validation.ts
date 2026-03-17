import type { GenerateRequest, ReplyLength, Tone } from "./types";

const TONES: Tone[] = ["professional", "friendly", "direct", "empathetic"];
const LENGTHS: ReplyLength[] = ["short", "medium", "long"];

type JsonObject = Record<string, unknown>;

export function parseGenerateRequest(body: unknown): GenerateRequest {
	const b: JsonObject = (body && typeof body === "object") ? (body as JsonObject) : {};
	const inputEmail = typeof b.inputEmail === "string" ? b.inputEmail : "";
	const tone = TONES.includes(b.tone as Tone) ? (b.tone as Tone) : undefined;
	const length = LENGTHS.includes(b.length as ReplyLength) ? (b.length as ReplyLength) : undefined;
	const signature = typeof b.signature === "string" ? b.signature : undefined;

	if (!inputEmail.trim()) throw new Error("inputEmail is required");
	if (!tone) throw new Error(`tone must be one of: ${TONES.join(", ")}`);
	if (!length) throw new Error(`length must be one of: ${LENGTHS.join(", ")}`);

	return {
		inputEmail,
		tone,
		length,
		signature,
		senderName: typeof b.senderName === "string" ? b.senderName : undefined,
		senderRole: typeof b.senderRole === "string" ? b.senderRole : undefined,
		senderCompany: typeof b.senderCompany === "string" ? b.senderCompany : undefined,
	};
}
