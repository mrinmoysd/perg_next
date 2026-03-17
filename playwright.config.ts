import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./playwright",
	timeout: 60_000,
	expect: { timeout: 10_000 },
	fullyParallel: true,
	reporter: "list",
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
		trace: "retain-on-failure",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
