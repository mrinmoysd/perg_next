"use client";

/**
 * Minimal PostHog wrapper.
 *
 * - No-ops unless NEXT_PUBLIC_POSTHOG_KEY is set.
 * - Avoids sending raw email content.
 */

type CaptureProps = Record<string, unknown>;

declare global {
	interface Window {
		posthog?: {
			capture: (event: string, props?: CaptureProps) => void;
			identify?: (distinctId: string, props?: CaptureProps) => void;
		};
	}
}

export function capture(event: string, props?: CaptureProps) {
	if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
	if (typeof window === "undefined") return;
	window.posthog?.capture?.(event, props);
}

export function identify(distinctId: string, props?: CaptureProps) {
	if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
	if (typeof window === "undefined") return;
	window.posthog?.identify?.(distinctId, props);
}
