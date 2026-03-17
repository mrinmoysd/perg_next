import { NextResponse } from "next/server";
import { generateReply } from "@/lib/generate/llmAdapter";
import { parseGenerateRequest } from "@/lib/generate/validation";
import { buildReplyPrompt } from "@/lib/generate/promptBuilder";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdmin";
import { getAccessTokenCookie } from "@/lib/supabase/authCookie";
import { ensureUserProfileRow } from "@/lib/supabase/ensureUserProfileRow";
import { getPlanForUser } from "@/lib/billing/subscriptionService";
import { canGenerate, incrementSuccess } from "@/lib/billing/quotaService";

export async function POST(req: Request) {
	const startedAt = Date.now();
	try {
		const body = await req.json();
		let parsed = parseGenerateRequest(body);

		// Optional auth + persistence. If not configured or not logged in, generation still works.
		let authedUserId: string | null = null;
		let signatureFromProfile: string | null = null;
			let quota: { remaining: number; limit: number; used: number; day: string } | null = null;
			let authedPlan: Awaited<ReturnType<typeof getPlanForUser>> | null = null;
		try {
			const token = await getAccessTokenCookie();
			if (token) {
				const supabase = createSupabaseAdminClient();
				const { data } = await supabase.auth.getUser(token);
				authedUserId = data?.user?.id ?? null;
				if (authedUserId) {
					await ensureUserProfileRow(supabase, {
						id: authedUserId,
						email: data?.user?.email ?? null,
					});

					// Sprint 3: Quota enforcement (server-side)
						const plan = await getPlanForUser(authedUserId);
						authedPlan = plan;
						const check = await canGenerate(authedUserId, plan);
					quota = { remaining: check.remaining, limit: check.limit, used: check.used, day: check.day };
					if (!check.allowed) {
						return NextResponse.json(
							{
								error: "QUOTA_EXCEEDED",
								quota,
								upgrade_url: "/settings/billing",
							},
							{ status: 429 }
						);
					}

					// Pull signature defaults (best-effort)
					const { data: profile } = await supabase
						.from("users")
						.select("signature")
						.eq("id", authedUserId)
						.maybeSingle();
					signatureFromProfile = typeof profile?.signature === "string" ? profile.signature : null;
				}
			}
			} catch {
				// ignore optional auth/persistence bootstrap errors; still return generated reply
			}

		if (signatureFromProfile && !parsed.signature) {
			parsed = { ...parsed, signature: signatureFromProfile };
		}
		// Build prompt here so we can later store it alongside the generation.
		const prompt = buildReplyPrompt(parsed);

		const result = await generateReply(parsed);
		const latencyMs = Date.now() - startedAt;
		const requestId = crypto.randomUUID();
		let generationId: string | null = null;

		if (authedUserId) {
			const supabase = createSupabaseAdminClient();
			const { error: insertError } = await supabase.from("generations").insert({
				id: requestId,
				user_id: authedUserId,
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
				console.error("Failed to insert generation", {
					userId: authedUserId,
					requestId,
					message: insertError.message,
					details: (insertError as { details?: string | null }).details ?? null,
					hint: (insertError as { hint?: string | null }).hint ?? null,
					code: (insertError as { code?: string | null }).code ?? null,
				});
				return NextResponse.json(
					{
						error: "Failed to save generation",
						detail: process.env.NODE_ENV === "development" ? insertError.message : undefined,
					},
					{ status: 500 }
				);
			}

				generationId = requestId;
				try {
					await incrementSuccess(authedUserId);
					if (authedPlan) {
						const updatedQuota = await canGenerate(authedUserId, authedPlan);
						quota = {
							remaining: updatedQuota.remaining,
							limit: updatedQuota.limit,
							used: updatedQuota.used,
							day: updatedQuota.day,
						};
					}
				} catch {
					// The generation was persisted successfully, so keep the reply usable.
				}
		}

		return NextResponse.json({
			requestId,
			generationId,
			reply: result.reply,
			model: result.model,
			latencyMs,
			quota,
		});
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Bad Request";
		return NextResponse.json(
			{ error: message },
			{ status: 400 }
		);
	}
}
