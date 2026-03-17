import { test, expect } from "@playwright/test";

/**
 * App smoke tests (core flow)
 *
 * These are intentionally written to be safe in CI:
 * - They don't require real Supabase magic-link or Google OAuth.
 * - They bootstrap the app session via /api/auth/set-session.
 *
 * Provide env:
 * - E2E_ACCESS_TOKEN: a Supabase access token (JWT) for a test user.
 */

test.describe("app smoke", () => {
	test.skip(!process.env.E2E_ACCESS_TOKEN, "E2E_ACCESS_TOKEN not set");

	test("dashboard → generate → save → history", async ({ page, context, baseURL }) => {
		const url = baseURL ?? "http://localhost:3000";

		// Bootstrap the httpOnly `session` cookie via server route.
		const bootstrap = await page.request.post(`${url}/api/auth/set-session`, {
			data: { access_token: process.env.E2E_ACCESS_TOKEN },
		});
		expect(bootstrap.ok(), await bootstrap.text()).toBeTruthy();

		// Ensure cookies are present in the browser context.
		await context.storageState();

		await page.goto(`${url}/dashboard`);
		await expect(page.getByRole("heading", { name: /Generate an email reply/i })).toBeVisible();

		await page.getByLabel("Paste the email").fill(
			"Hi — can we reschedule to tomorrow afternoon? Let me know what works."
		);
		await page.getByRole("button", { name: /Generate reply/i }).click();

		// Reply card renders after the request completes.
		await expect(page.getByText(/Variations/i)).toBeVisible();

		// Save
		await page.getByRole("button", { name: /Save/i }).click();

		await page.goto(`${url}/history`);
		await expect(page.getByRole("heading", { name: /History/i })).toBeVisible();
	});
});
