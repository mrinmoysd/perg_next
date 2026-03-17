import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdmin";
import { requireAuthedUser } from "@/lib/supabase/getUserFromRequest";
import { parseGenerateRequest } from "@/lib/generate/validation";
import { buildReplyPrompt } from "@/lib/generate/promptBuilder";
import { generateReply } from "@/lib/generate/llmAdapter";
import { getPlanForUser } from "@/lib/billing/subscriptionService";
import { canGenerate, incrementSuccess } from "@/lib/billing/quotaService";

type JsonObject = Record<string, unknown>;

export async function POST(req: Request) {
	const startedAt = Date.now();
	try {
		const authed = await requireAuthedUser();
		const body: unknown = await req.json();
		const b: JsonObject = body && typeof body === "object" ? (body as JsonObject) : {};
		const parentId = typeof b.parentId === "string" ? b.parentId : (typeof b.parent_id === "string" ? b.parent_id : "");
		if (!parentId) return NextResponse.json({ error: "parentId is required" }, { status: 400 });

		const supabase = createSupabaseAdminClient();
		const { data: parent, error: parentErr } = await supabase
			.from("generations")
			.select("id,email_input,tone,length")
			.eq("id", parentId)
			.eq("user_id", authed.id)
			.maybeSingle();
		if (parentErr) throw parentErr;
		if (!parent) return NextResponse.json({ error: "Not found" }, { status: 404 });

		// Quota enforcement
		const plan = await getPlanForUser(authed.id);
		const check = await canGenerate(authed.id, plan);
		const quota = { remaining: check.remaining, limit: check.limit, used: check.used, day: check.day };
		if (!check.allowed) {
			return NextResponse.json(
				{ error: "QUOTA_EXCEEDED", quota, upgrade_url: "/settings/billing" },
				{ status: 429 }
			);
		}

		// Pull signature defaults (best-effort)
		let signatureFromProfile: string | null = null;
		const { data: profile } = await supabase
			.from("users")
			.select("signature")
			.eq("id", authed.id)
			.maybeSingle();
		signatureFromProfile = typeof profile?.signature === "string" ? profile.signature : null;

		// Allow overriding tone/length/input; default to parent.
		const inputEmail = typeof b.inputEmail === "string" ? b.inputEmail : parent.email_input;
		const tone = typeof b.tone === "string" ? b.tone : parent.tone;
		const length = typeof b.length === "string" ? b.length : parent.length;
		let parsed = parseGenerateRequest({ inputEmail, tone, length, signature: typeof b.signature === "string" ? b.signature : undefined });
		if (signatureFromProfile && !parsed.signature) parsed = { ...parsed, signature: signatureFromProfile };

		const prompt = buildReplyPrompt(parsed);
		const result = await generateReply(parsed);
		const latencyMs = Date.now() - startedAt;
		const requestId = crypto.randomUUID();
		let generationId: string | null = null;

		const { error: insertError } = await supabase.from("generations").insert({
			id: requestId,
			user_id: authed.id,
			parent_id: parent.id,
			email_input: parsed.inputEmail,
			tone: parsed.tone,
			length: parsed.length,
			ai_model: result.model,
			prompt,
			ai_reply: result.reply,
			latency_ms: latencyMs,
			status: "succeeded",
		});
		if (insertError) {
			console.error("Failed to insert regenerated generation", {
				userId: authed.id,
				parentId: parent.id,
				requestId,
				message: insertError.message,
				details: (insertError as { details?: string | null }).details ?? null,
				hint: (insertError as { hint?: string | null }).hint ?? null,
				code: (insertError as { code?: string | null }).code ?? null,
			});
			return NextResponse.json(
				{
					error: "Failed to save regenerated reply",
					detail: process.env.NODE_ENV === "development" ? insertError.message : undefined,
				},
				{ status: 500 }
			);
		}

		generationId = requestId;

		try {
			await incrementSuccess(authed.id);
			const updatedQuota = await canGenerate(authed.id, plan);
			quota.remaining = updatedQuota.remaining;
			quota.limit = updatedQuota.limit;
			quota.used = updatedQuota.used;
			quota.day = updatedQuota.day;
		} catch (incrementError: unknown) {
			console.error("Failed to increment quota after regenerate", {
				userId: authed.id,
				parentId: parent.id,
				requestId,
				error: incrementError,
			});
			// Keep the regenerated reply usable once it has been persisted.
		}

		return NextResponse.json({
			requestId,
			generationId,
			reply: result.reply,
			model: result.model,
			latencyMs,
			quota,
		});
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : "Bad Request";
		console.error("Regenerate failed", e);
		return NextResponse.json(
			{
				error: message,
				detail: process.env.NODE_ENV === "development" && e instanceof Error ? e.message : undefined,
			},
			{ status: message === "Not authenticated" ? 401 : 400 }
		);
	}
}
