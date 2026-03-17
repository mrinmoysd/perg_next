import { NextResponse } from "next/server";

import { clearAccessTokenCookie } from "@/lib/supabase/authCookie";

export async function POST() {
	await clearAccessTokenCookie();
	return NextResponse.json({ ok: true });
}
