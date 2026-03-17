import Stripe from "stripe";

function requireEnv(name: string): string {
	const v = process.env[name];
	if (!v) throw new Error(`Missing env var: ${name}`);
	return v;
}

export function getStripeClient(): Stripe {
	const key = requireEnv("STRIPE_SECRET_KEY");
	return new Stripe(key, { apiVersion: "2025-08-27.basil" });
}

export function getStripeWebhookSecret(): string {
	return requireEnv("STRIPE_WEBHOOK_SECRET");
}

export function getAppUrl(): string {
	return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
