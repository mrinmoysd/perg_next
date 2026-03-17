import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/history"]; // Sprint 2/3

export function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;
	const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
	if (!needsAuth) return NextResponse.next();

	const token = req.cookies.get("perg_access_token")?.value;
	if (token) return NextResponse.next();

	const url = req.nextUrl.clone();
	url.pathname = "/login";
	url.searchParams.set("next", pathname);
	return NextResponse.redirect(url);
}

export const config = {
	matcher: ["/dashboard/:path*", "/settings/:path*", "/history/:path*"],
};
