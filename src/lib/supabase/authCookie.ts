import { cookies } from "next/headers";

const COOKIE_NAME = "perg_access_token";

export async function setAccessTokenCookie(token: string) {
	const cookieStore = await cookies();
	cookieStore.set(COOKIE_NAME, token, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge: 60 * 60 * 24 * 7,
	});
}

export async function clearAccessTokenCookie() {
	const cookieStore = await cookies();
	cookieStore.set(COOKIE_NAME, "", {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge: 0,
	});
}

export async function getAccessTokenCookie(): Promise<string | undefined> {
	const cookieStore = await cookies();
	return cookieStore.get(COOKIE_NAME)?.value;
}
