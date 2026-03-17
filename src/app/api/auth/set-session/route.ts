import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdmin";
import { setAccessTokenCookie } from "@/lib/supabase/authCookie";
import { ensureUserProfileRow } from "@/lib/supabase/ensureUserProfileRow";

type JsonObject = Record<string, unknown>;

export async function POST(req: Request) {
	try {
		const body: unknown = await req.json();
		const b: JsonObject = body && typeof body === "object" ? (body as JsonObject) : {};
		const accessToken = typeof b.access_token === "string" ? b.access_token : "";
		if (!accessToken) {
			return NextResponse.json({ error: "missing_access_token" }, { status: 400 });
		}

		const supabase = createSupabaseAdminClient();
		const { data, error } = await supabase.auth.getUser(accessToken);
		if (error || !data?.user) {
			return NextResponse.json({ error: "invalid_access_token" }, { status: 401 });
		}

		const user = data.user;
		await ensureUserProfileRow(supabase, {
			id: user.id,
			email: user.email ?? null,
		});

		await setAccessTokenCookie(accessToken);
		return NextResponse.json({ ok: true });
	} catch (error: unknown) {
		console.error("Failed to set session", error);
		return NextResponse.json(
			{
				error: "server_error",
				detail: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
			},
			{ status: 500 }
		);
	}
}
