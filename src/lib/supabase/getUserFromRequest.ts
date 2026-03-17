import { createSupabaseAdminClient } from "./serverAdmin";
import { getAccessTokenCookie } from "./authCookie";

export type AuthedUser = {
	id: string;
	email: string | null;
};

export async function requireAuthedUser(): Promise<AuthedUser> {
	const token = await getAccessTokenCookie();
	if (!token) throw new Error("Not authenticated");

	const supabase = createSupabaseAdminClient();
	const { data, error } = await supabase.auth.getUser(token);
	if (error || !data?.user) throw new Error("Not authenticated");

	return { id: data.user.id, email: data.user.email ?? null };
}
