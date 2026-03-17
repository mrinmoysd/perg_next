import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdmin";
import { requireAuthedUser } from "@/lib/supabase/getUserFromRequest";
import { clearAccessTokenCookie } from "@/lib/supabase/authCookie";

type JsonObject = Record<string, unknown>;

export async function GET() {
	try {
		const authed = await requireAuthedUser();
		const supabase = createSupabaseAdminClient();
		const { data, error } = await supabase
			.from("users")
			.select("id,email,name,job_title,company,signature,default_tone,plan")
			.eq("id", authed.id)
			.maybeSingle();
		if (error) throw error;
		return NextResponse.json({ user: data ?? null });
	} catch (e: unknown) {
		return NextResponse.json(
			{ error: e instanceof Error ? e.message : "Unauthorized" },
			{ status: 401 }
		);
	}
}

export async function PUT(req: Request) {
	try {
		const authed = await requireAuthedUser();
		const body: unknown = await req.json();
		const b: JsonObject = body && typeof body === "object" ? (body as JsonObject) : {};

		const patch: Record<string, unknown> = {};
		if (typeof b.name === "string") patch.name = b.name;
		if (typeof b.job_title === "string") patch.job_title = b.job_title;
		if (typeof b.company === "string") patch.company = b.company;
		if (typeof b.signature === "string") patch.signature = b.signature;
		if (typeof b.default_tone === "string") patch.default_tone = b.default_tone;

		const supabase = createSupabaseAdminClient();
		const { data, error } = await supabase
			.from("users")
			.update(patch)
			.eq("id", authed.id)
			.select("id,email,name,job_title,company,signature,default_tone,plan")
			.single();
		if (error) throw error;
		return NextResponse.json({ user: data });
	} catch (e: unknown) {
		return NextResponse.json(
			{ error: e instanceof Error ? e.message : "Unauthorized" },
			{ status: 401 }
		);
	}
}

export async function DELETE() {
	try {
		const authed = await requireAuthedUser();
		const supabase = createSupabaseAdminClient();

		// Delete the Supabase auth user first; app DB rows (public.users, generations, etc)
		// are keyed by the same id and will be deleted via foreign key cascades.
		const { error } = await supabase.auth.admin.deleteUser(authed.id);
		if (error) throw error;

		await clearAccessTokenCookie();
		return NextResponse.json({ ok: true });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : "Unauthorized";
		return NextResponse.json(
			{ error: message },
			{ status: message === "Not authenticated" ? 401 : 400 }
		);
	}
}
