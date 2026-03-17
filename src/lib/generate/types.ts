export type Tone = "professional" | "friendly" | "direct" | "empathetic";
export type ReplyLength = "short" | "medium" | "long";

export type GenerateRequest = {
	inputEmail: string;
	tone: Tone;
	length: ReplyLength;
	/**
	 * Optional signature line(s) to append/sign the reply with.
	 * This typically comes from the user's saved profile (settings).
	 */
	signature?: string;
	senderName?: string;
	senderRole?: string;
	senderCompany?: string;
};

export type GenerateResponse = {
	requestId: string;
	generationId: string | null;
	reply: string;
	model: string;
	latencyMs: number;
};
