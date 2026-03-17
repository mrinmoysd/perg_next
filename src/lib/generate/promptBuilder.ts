import type { GenerateRequest } from "./types";

export function buildReplyPrompt(req: GenerateRequest): string {
	const inputEmail = (req.inputEmail ?? "").trim();
	if (!inputEmail) throw new Error("inputEmail is required");

	const explicitSignature = (req.signature ?? "").trim();
	const signatureParts = [req.senderName, req.senderRole, req.senderCompany]
		.map((v) => (v ?? "").trim())
		.filter(Boolean);
	const derivedSignature = signatureParts.length ? signatureParts.join(" | ") : "";
	const signature = explicitSignature || derivedSignature || undefined;

	return [
		"You are an assistant that writes helpful, safe, accurate email replies.",
		"Write a reply to the email below.",
		"Constraints:",
		"- Output ONLY the reply body. No subject line.",
		"- Do not invent facts. If information is missing, ask a concise clarifying question or keep it generic.",
		"- Keep a respectful tone and avoid sensitive, private, or unsafe content.",
		`- Tone: ${req.tone}.`,
		`- Length: ${req.length}.`,
		signature ? `- Sign as: ${signature}` : "- No signature provided; do not sign with a name.",
		"",
		"Email:",
		inputEmail,
	].join("\n");
}
