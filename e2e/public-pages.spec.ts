import { test, expect } from "@playwright/test";

test("public pages render", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByRole("heading", { name: /Generate polished email replies/i })).toBeVisible();

	await page.goto("/pricing");
	await expect(page.getByRole("heading", { name: /Try free\. Upgrade when you need more/i })).toBeVisible();

	await page.goto("/help");
	await expect(page.getByRole("heading", { name: /How can we help/i })).toBeVisible();

	await page.goto("/privacy");
	await expect(page.getByRole("heading", { name: /Privacy policy/i })).toBeVisible();

	await page.goto("/terms");
	await expect(page.getByRole("heading", { name: /Terms of service/i })).toBeVisible();
});
