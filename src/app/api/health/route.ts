import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json({
		ok: true,
		service: "personalized-email-reply-generator",
		version: "sprint-1",
	});
}
