import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdmin";
import { requireAuthedUser } from "@/lib/supabase/getUserFromRequest";

export async function GET(
	_req: Request,
	ctx: { params: Promise<{ id: string }> }
) {
	try {
		const authed = await requireAuthedUser();
		const { id } = await ctx.params;
		if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

		const supabase = createSupabaseAdminClient();
		const { data, error } = await supabase
			.from("generations")
			.select("id,parent_id,email_input,tone,length,ai_reply,ai_model,prompt,status,is_saved,created_at")
			.eq("id", id)
			.eq("user_id", authed.id)
			.maybeSingle();
		if (error) throw error;
		if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
		return NextResponse.json({ item: data });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : "Unauthorized";
		return NextResponse.json({ error: message }, { status: message === "Not authenticated" ? 401 : 400 });
	}
}
