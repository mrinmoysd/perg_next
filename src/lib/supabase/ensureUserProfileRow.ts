import type { SupabaseClient } from "@supabase/supabase-js";

type AuthUserProfile = {
	id: string;
	email: string | null;
};

type UserRow = {
	id: string;
	email: string;
	name: string | null;
	job_title: string | null;
	company: string | null;
	signature: string | null;
	default_tone: string | null;
	plan: string;
};

function buildLegacyEmail(email: string, id: string): string {
	return `${email}__legacy__${id}`;
}

async function reassignRows(
	supabase: SupabaseClient,
	table: "generations" | "subscriptions" | "usage_counters" | "audit_events",
	oldUserId: string,
	newUserId: string
) {
	const { error } = await supabase
		.from(table)
		.update({ user_id: newUserId })
		.eq("user_id", oldUserId);
	if (error) throw error;
}

async function mergeUserRows(
	supabase: SupabaseClient,
	existingRow: UserRow,
	nextUser: AuthUserProfile
) {
	const email = nextUser.email ?? "unknown";
	const legacyEmail = buildLegacyEmail(email, existingRow.id);

	const { error: detachEmailError } = await supabase
		.from("users")
		.update({ email: legacyEmail })
		.eq("id", existingRow.id);
	if (detachEmailError) throw detachEmailError;

	const { error: insertNewError } = await supabase
		.from("users")
		.insert({
			id: nextUser.id,
			email,
			name: existingRow.name,
			job_title: existingRow.job_title,
			company: existingRow.company,
			signature: existingRow.signature,
			default_tone: existingRow.default_tone,
			plan: existingRow.plan,
		});
	if (insertNewError) throw insertNewError;

	await reassignRows(supabase, "generations", existingRow.id, nextUser.id);
	await reassignRows(supabase, "subscriptions", existingRow.id, nextUser.id);
	await reassignRows(supabase, "usage_counters", existingRow.id, nextUser.id);
	await reassignRows(supabase, "audit_events", existingRow.id, nextUser.id);

	const { error: deleteOldError } = await supabase
		.from("users")
		.delete()
		.eq("id", existingRow.id);
	if (deleteOldError) throw deleteOldError;
}

export async function ensureUserProfileRow(
	supabase: SupabaseClient,
	user: AuthUserProfile
): Promise<void> {
	const email = user.email ?? "unknown";

	const { data: existingById, error: byIdError } = await supabase
		.from("users")
		.select("id,email")
		.eq("id", user.id)
		.maybeSingle();
	if (byIdError) throw byIdError;

	if (existingById) {
		if (existingById.email !== email) {
			const { error: updateEmailError } = await supabase
				.from("users")
				.update({ email })
				.eq("id", user.id);
			if (updateEmailError) throw updateEmailError;
		}
		return;
	}

	const { data: existingByEmail, error: byEmailError } = await supabase
		.from("users")
		.select("id,email,name,job_title,company,signature,default_tone,plan")
		.eq("email", email)
		.maybeSingle<UserRow>();
	if (byEmailError) throw byEmailError;

	if (existingByEmail) {
		await mergeUserRows(supabase, existingByEmail, user);
		return;
	}

	const { error: insertError } = await supabase
		.from("users")
		.insert({ id: user.id, email });
	if (insertError) throw insertError;
}
