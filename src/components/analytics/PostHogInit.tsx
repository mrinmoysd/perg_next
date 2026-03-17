"use client";

import { useEffect } from "react";

type PosthogLike = {
	init: (key: string, options?: Record<string, unknown>) => void;
};

export function PostHogInit() {
	useEffect(() => {
		const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
		if (!key) return;

		// Lazy-load to avoid bloating the main bundle when analytics is not configured.
		(async () => {
			const mod = (await import("posthog-js")) as unknown as { default: PosthogLike };
			mod.default.init(key, {
				api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
				capture_pageview: true,
			});
		})();
	}, []);

	return null;
}
