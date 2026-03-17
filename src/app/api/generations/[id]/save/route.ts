import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdmin";
import { requireAuthedUser } from "@/lib/supabase/getUserFromRequest";

type JsonObject = Record<string, unknown>;

export async function POST(
	req: Request,
	ctx: { params: Promise<{ id: string }> }
) {
	try {
		const authed = await requireAuthedUser();
		const { id } = await ctx.params;
		if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

		let isSaved: boolean | undefined;
		if (req.headers.get("content-type")?.includes("application/json")) {
			const body: unknown = await req.json().catch(() => null);
			const b: JsonObject = body && typeof body === "object" ? (body as JsonObject) : {};
			if (typeof b.is_saved === "boolean") isSaved = b.is_saved;
			if (typeof b.saved === "boolean") isSaved = b.saved;
		}

		const supabase = createSupabaseAdminClient();
		if (typeof isSaved !== "boolean") {
			// Toggle if not provided
			const { data: current } = await supabase
				.from("generations")
				.select("is_saved")
				.eq("id", id)
				.eq("user_id", authed.id)
				.maybeSingle();
			if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
			isSaved = !current.is_saved;
		}

		const { data, error } = await supabase
			.from("generations")
			.update({ is_saved: isSaved })
			.eq("id", id)
			.eq("user_id", authed.id)
			.select("id,is_saved")
			.maybeSingle();
		if (error) throw error;
		if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

		return NextResponse.json({ item: data });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : "Unauthorized";
		return NextResponse.json({ error: message }, { status: message === "Not authenticated" ? 401 : 400 });
	}
}
