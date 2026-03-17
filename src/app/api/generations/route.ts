import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdmin";
import { requireAuthedUser } from "@/lib/supabase/getUserFromRequest";

type JsonObject = Record<string, unknown>;

export async function GET(req: Request) {
	try {
		const authed = await requireAuthedUser();
		const url = new URL(req.url);
		const limit = Math.min(Number(url.searchParams.get("limit") ?? 20) || 20, 50);
		const saved = url.searchParams.get("saved");
		const onlySaved = saved === "true" ? true : saved === "false" ? false : undefined;
		const qText = (url.searchParams.get("q") ?? "").trim();

		const supabase = createSupabaseAdminClient();
		let q = supabase
			.from("generations")
			.select("id,email_input,tone,length,ai_reply,ai_model,status,is_saved,created_at")
			.eq("user_id", authed.id)
			.order("created_at", { ascending: false })
			.limit(limit);

		if (typeof onlySaved === "boolean") q = q.eq("is_saved", onlySaved);
		if (qText) {
			// Simple keyword search over email input + reply.
			// NOTE: This relies on PostgREST `or()` expression support.
			// If a more advanced experience is needed later, add full-text search.
			const escaped = qText.replace(/,/g, " ");
			q = q.or(`email_input.ilike.%${escaped}%,ai_reply.ilike.%${escaped}%`);
		}
		const { data, error } = await q;
		if (error) throw error;
		return NextResponse.json({ items: data ?? [] });
	} catch (e: unknown) {
		return NextResponse.json(
			{ error: e instanceof Error ? e.message : "Unauthorized" },
			{ status: 401 }
		);
	}
}

export async function PATCH(req: Request) {
	try {
		const authed = await requireAuthedUser();
		const body: unknown = await req.json();
		const b: JsonObject = body && typeof body === "object" ? (body as JsonObject) : {};
		const id = typeof b.id === "string" ? b.id : "";
		const is_saved = typeof b.is_saved === "boolean" ? b.is_saved : undefined;
		if (!id) throw new Error("id is required");
		if (typeof is_saved !== "boolean") throw new Error("is_saved must be boolean");

		const supabase = createSupabaseAdminClient();
		const { data, error } = await supabase
			.from("generations")
			.update({ is_saved })
			.eq("id", id)
			.eq("user_id", authed.id)
			.select("id,is_saved")
			.single();
		if (error) throw error;
		return NextResponse.json({ item: data });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : "Unauthorized";
		return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
	}
}
