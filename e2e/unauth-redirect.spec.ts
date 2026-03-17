import { test, expect } from "@playwright/test";

test("redirects protected routes to /login when logged out", async ({ page }) => {
	await page.goto("/dashboard");

	await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
	await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});
