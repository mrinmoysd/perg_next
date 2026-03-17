import { describe, it, expect, vi, beforeEach } from "vitest";

// This test focuses on the handler's duplicate-event behavior.
// We mock Stripe verification and Supabase inserts.

vi.mock("next/headers", () => ({
	headers: async () => new Headers({ "stripe-signature": "sig" }),
}));

const constructEvent = vi.fn();
vi.mock("@/lib/billing/stripe", () => ({
	getStripeClient: () => ({
		webhooks: { constructEvent },
	}),
	getStripeWebhookSecret: () => "whsec_test",
}));

type InsertResult = { error: null | { message?: string } };

function makeSupabase(insertStripeEvents: () => Promise<InsertResult>) {
	return {
		from: (table: string) => {
			if (table === "stripe_events") {
				return {
					insert: insertStripeEvents,
				};
			}
			// audit/events and other tables are best-effort in this handler.
			return {
				insert: async () => ({ error: null }),
				upsert: async () => ({ error: null }),
				update: async () => ({ error: null }),
				select: () => ({
					eq: () => ({
						order: () => ({
							limit: () => ({ maybeSingle: async () => ({ data: null }) }),
						}),
					}),
				}),
			};
		},
	};
}

const createSupabaseAdminClient = vi.fn();
vi.mock("@/lib/supabase/serverAdmin", () => ({
	createSupabaseAdminClient: () => createSupabaseAdminClient(),
}));

import { POST } from "./route";

describe("Stripe webhook idempotency", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		constructEvent.mockReturnValue({
			id: "evt_123",
			type: "checkout.session.completed",
			created: 1,
			livemode: false,
			data: { object: { customer: null, subscription: null, client_reference_id: null } },
		});
	});

	it("returns deduped=true when stripe_events insert is duplicate", async () => {
		createSupabaseAdminClient.mockReturnValue(
			makeSupabase(async () => ({ error: { message: "duplicate key value violates unique constraint" } }))
		);
		const req = new Request("http://localhost/api/webhooks/stripe", {
			method: "POST",
			body: "{}",
		});
		const res = await POST(req);
		const json = await res.json();
		expect(json).toMatchObject({ received: true, deduped: true });
	});

	it("processes normally when stripe_events insert succeeds", async () => {
		createSupabaseAdminClient.mockReturnValue(
			makeSupabase(async () => ({ error: null }))
		);
		const req = new Request("http://localhost/api/webhooks/stripe", {
			method: "POST",
			body: "{}",
		});
		const res = await POST(req);
		const json = await res.json();
		expect(json).toMatchObject({ received: true });
		expect(json.deduped).toBeUndefined();
	});
});
