import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdmin";
import { setAccessTokenCookie } from "@/lib/supabase/authCookie";
import { ensureUserProfileRow } from "@/lib/supabase/ensureUserProfileRow";

export async function GET(req: Request) {
	const url = new URL(req.url);
	const appOrigin = (process.env.NEXT_PUBLIC_APP_URL ?? url.origin).replace(/\/+$/, "");

	// Supabase magic link returns tokens in URL fragment; Next.js server route can't read fragment.
	// We support code-based exchange (PKCE) when configured.
	const code = url.searchParams.get("code");
	const next = url.searchParams.get("next") ?? "/dashboard";
	if (!code) return NextResponse.redirect(new URL("/login", appOrigin));

	const supabase = createSupabaseAdminClient();
	const { data, error } = await supabase.auth.exchangeCodeForSession(code);
	if (error || !data?.session?.access_token) {
		return NextResponse.redirect(new URL("/login", appOrigin));
	}

	// Ensure profile row exists.
	if (data.user) {
		await ensureUserProfileRow(supabase, {
			id: data.user.id,
			email: data.user.email ?? null,
		});
	}

	await setAccessTokenCookie(data.session.access_token);
	return NextResponse.redirect(new URL(next, appOrigin));
}
