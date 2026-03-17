"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Sparkles } from "lucide-react";

import { PageShell } from "@/components/app/PageShell";
import { PageHeader } from "@/components/app/PageHeader";
import { InlineMessage } from "@/components/app/InlineMessage";
import { EmptyState } from "@/components/app/EmptyState";
import { LoadingState } from "@/components/app/LoadingState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { capture } from "@/lib/analytics/posthog";

type Plan = "free" | "pro";

type Profile = {
	id: string;
	email: string;
	plan: Plan;
};

export default function BillingPage() {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isUpgrading, setIsUpgrading] = useState(false);
	const [isOpeningPortal, setIsOpeningPortal] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);

	const isPro = profile?.plan === "pro";
	const canUpgrade = useMemo(() => !isUpgrading && !isPro, [isUpgrading, isPro]);

	useEffect(() => {
		(async () => {
			setIsLoading(true);
			setError(null);
			try {
				const res = await fetch("/api/user");
				const json: unknown = await res.json();
				const j = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
				if (!res.ok) throw new Error(typeof j.error === "string" ? j.error : "Failed to load");
				const user = (j.user && typeof j.user === "object") ? (j.user as Record<string, unknown>) : undefined;
				setProfile({
					id: String(user?.id ?? ""),
					email: String(user?.email ?? ""),
					plan: user?.plan === "pro" ? "pro" : "free",
				});
				const params = new URLSearchParams(window.location.search);
				if (params.get("success") === "1") setMessage("Payment successful. Your plan will update in a moment.");
				if (params.get("canceled") === "1") setMessage("Checkout canceled.");
			} catch (e: unknown) {
				setError(e instanceof Error ? e.message : "Failed to load");
			} finally {
				setIsLoading(false);
			}
		})();
	}, []);

	async function onUpgrade() {
		capture("upgrade_clicked", { source: "settings_billing" });
		setIsUpgrading(true);
		setError(null);
		try {
			const res = await fetch("/api/billing/checkout", { method: "POST" });
			const json: unknown = await res.json();
			const j = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
			if (!res.ok) throw new Error(typeof j.error === "string" ? j.error : "Failed to start checkout");
			const url = typeof j.url === "string" ? j.url : "";
			if (!url) throw new Error("Stripe session URL missing");
			window.location.assign(url);
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Failed to start checkout");
			setIsUpgrading(false);
		}
	}

	async function onOpenPortal() {
		setIsOpeningPortal(true);
		setError(null);
		try {
			const res = await fetch("/api/billing/portal", { method: "POST" });
			const json: unknown = await res.json();
			const j = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
			if (!res.ok) throw new Error(typeof j.error === "string" ? j.error : "Failed to open portal");
			const url = typeof j.url === "string" ? j.url : "";
			if (!url) throw new Error("Portal URL missing");
			window.location.assign(url);
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Failed to open portal");
			setIsOpeningPortal(false);
		}
	}

	return (
		<PageShell>
			<PageHeader
				title="Billing"
				description="Manage your plan, upgrade path, and subscription controls."
				actions={profile ? <Badge variant={isPro ? "default" : "outline"}>{isPro ? "Pro active" : "Free plan"}</Badge> : null}
			/>

			{message ? <div className="mt-6"><InlineMessage variant="success">{message}</InlineMessage></div> : null}
			{error ? <div className="mt-6"><InlineMessage variant="error">{error}</InlineMessage></div> : null}

			<Card className="mt-6 bg-card/90">
				<CardContent className="grid gap-6 pt-6">
					{isLoading ? (
						<LoadingState label="Loading billing status..." />
					) : profile ? (
						<>
							<div className="grid gap-4 rounded-[calc(var(--radius)+2px)] border border-border/70 bg-background/72 p-5 lg:grid-cols-[1.1fr_0.9fr]">
								<div>
									<div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Account</div>
									<div className="mt-2 text-lg font-semibold tracking-tight">{profile.email}</div>
									<p className="mt-2 text-sm leading-6 text-muted-foreground">
										Your current plan determines daily reply volume and whether Stripe portal controls are available.
									</p>
								</div>
								<div className="rounded-[calc(var(--radius)-4px)] border border-border/70 bg-card/85 p-4">
									<div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Current plan</div>
									<div className="mt-2 flex items-center gap-2">
										<Badge variant={isPro ? "default" : "secondary"}>{isPro ? "Pro" : "Free"}</Badge>
										<span className="text-sm text-muted-foreground">{isPro ? "Higher daily limits and subscription controls" : "Starter usage for lighter workflows"}</span>
									</div>
									{isPro ? (
										<Button variant="outline" disabled={isOpeningPortal} onClick={onOpenPortal} className="mt-4 w-full">
											{isOpeningPortal ? "Opening..." : "Manage subscription"}
										</Button>
									) : null}
								</div>
							</div>

							<Separator />

							<div className="grid gap-5 lg:grid-cols-2">
								<Card className="bg-card/88">
									<CardHeader>
										<CardTitle className="flex items-center justify-between">
											<span>Free</span>
											{!isPro ? <Badge variant="secondary">Current</Badge> : null}
										</CardTitle>
									</CardHeader>
									<CardContent className="grid gap-4">
										<div>
											<div className="text-4xl font-semibold tracking-tight">$0</div>
											<div className="mt-1 text-sm text-muted-foreground">Good for testing the workflow.</div>
										</div>
										<ul className="space-y-2 text-sm text-muted-foreground">
											<li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4" /> Daily reply limit</li>
											<li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4" /> History + saved replies</li>
											<li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4" /> Tone + length controls</li>
										</ul>
										<Button variant="outline" disabled>
											You&apos;re on Free
										</Button>
									</CardContent>
								</Card>

								<Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-card via-card to-accent/45 shadow-[0_22px_42px_-30px_hsl(var(--primary)/0.7)]">
									<div className="pointer-events-none absolute right-[-60px] top-[-60px] h-44 w-44 rounded-full bg-primary/12" />
									<CardHeader>
										<CardTitle className="flex items-center justify-between">
											<span className="inline-flex items-center gap-2">
												<Sparkles className="h-4 w-4 text-primary" />
												Pro
											</span>
											{isPro ? <Badge>Active</Badge> : <Badge variant="secondary">Recommended</Badge>}
										</CardTitle>
									</CardHeader>
									<CardContent className="grid gap-4">
										<div>
											<div className="text-4xl font-semibold tracking-tight">Upgrade</div>
											<div className="mt-1 text-sm text-muted-foreground">Built for heavier daily use and fewer interruptions.</div>
										</div>
										<ul className="space-y-2 text-sm text-muted-foreground">
											<li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary" /> Higher daily limits</li>
											<li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary" /> Priority processing</li>
											<li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary" /> Stripe portal management</li>
										</ul>
										<Button disabled={!canUpgrade} onClick={onUpgrade}>
											{isPro ? "You're on Pro" : isUpgrading ? "Redirecting..." : "Upgrade to Pro"}
										</Button>
										<p className="text-xs leading-6 text-muted-foreground">
											Secure checkout via Stripe. Your plan updates automatically after payment confirmation.
										</p>
									</CardContent>
								</Card>
							</div>
						</>
					) : (
						<EmptyState
							title="No billing profile"
							description="Try refreshing the page or logging in again."
						/>
					)}
				</CardContent>
			</Card>
		</PageShell>
	);
}
