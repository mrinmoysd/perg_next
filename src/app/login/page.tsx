"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { PageShell } from "@/components/app/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InlineMessage } from "@/components/app/InlineMessage";
import { Badge } from "@/components/ui/badge";
import { capture } from "@/lib/analytics/posthog";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [sent, setSent] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSending, setIsSending] = useState(false);
	const [isOAuthLoading, setIsOAuthLoading] = useState(false);
	const canSend = useMemo(() => email.trim().includes("@") && !sent, [email, sent]);

	useEffect(() => {
		const hash = typeof window !== "undefined" ? window.location.hash : "";
		if (!hash.startsWith("#")) return;
		const raw = hash.slice(1);
		if (!raw.includes("access_token=")) return;

		const params = new URLSearchParams(raw);
		const access_token = params.get("access_token");
		if (!access_token) return;

		(async () => {
			try {
				const res = await fetch("/api/auth/set-session", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ access_token }),
				});
				if (!res.ok) {
					const json: unknown = await res.json().catch(() => null);
					const j = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
					throw new Error(typeof j.error === "string" ? j.error : "auth_failed");
				}

				window.history.replaceState({}, "", window.location.pathname);
				const next = new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
				router.replace(next);
			} catch (e: unknown) {
				setError(e instanceof Error ? e.message : "Failed to sign in");
			}
		})();
	}, [router]);

	async function sendMagicLink() {
		capture("auth.magic_link_clicked");
		setError(null);
		setIsSending(true);
		try {
			const supabase = createSupabaseBrowserClient();
			const redirectTo = `${window.location.origin}/login`;
			const { error: err } = await supabase.auth.signInWithOtp({
				email: email.trim(),
				options: { emailRedirectTo: redirectTo },
			});
			if (err) throw err;
			setSent(true);
			capture("auth.magic_link_sent");
		} catch (e: unknown) {
			capture("auth.magic_link_failed");
			setError(e instanceof Error ? e.message : "Failed to send link");
		} finally {
			setIsSending(false);
		}
	}

	async function signInWithGoogle() {
		capture("auth.google_clicked");
		setError(null);
		setIsOAuthLoading(true);
		try {
			const supabase = createSupabaseBrowserClient();
			const next = new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
			const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
			const { error: err } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: { redirectTo },
			});
			if (err) throw err;
		} catch (e: unknown) {
			capture("auth.google_failed");
			setError(e instanceof Error ? e.message : "Failed to sign in with Google");
			setIsOAuthLoading(false);
		}
	}

	return (
		<div className="relative min-h-dvh overflow-hidden">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-x-0 top-[-200px] -z-10 mx-auto h-[560px] w-full max-w-5xl bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.18),_transparent_55%)]"
			/>
			<PageShell className="max-w-6xl">
				<div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
					<div className="max-w-xl">
						<Badge variant="secondary">Secure access</Badge>
						<h1 className="mt-5 text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl">
							Sign in and get back to writing better replies.
						</h1>
						<p className="mt-5 text-lg leading-8 text-muted-foreground">
							Keep your history, saved responses, profile defaults, and billing in one place. Magic link or Google, whichever is faster for you.
						</p>
						<div className="mt-8 grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
							<div className="rounded-[calc(var(--radius)+2px)] border border-border/70 bg-card/72 p-4 shadow-sm">
								<Sparkles className="h-5 w-5 text-primary" />
								<div className="mt-3 font-semibold text-foreground">Resume your workflow</div>
								<p className="mt-2 leading-6">Pick up saved drafts and previous variations without starting over.</p>
							</div>
							<div className="rounded-[calc(var(--radius)+2px)] border border-border/70 bg-card/72 p-4 shadow-sm">
								<LockKeyhole className="h-5 w-5 text-primary" />
								<div className="mt-3 font-semibold text-foreground">Private by default</div>
								<p className="mt-2 leading-6">Authentication, account controls, and a clear path to delete your data.</p>
							</div>
						</div>
					</div>

					<Card className="mx-auto w-full max-w-lg bg-card/94">
						<CardHeader className="border-b border-border/70">
							<CardTitle>Continue to PERG</CardTitle>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								Use Google for the fastest setup, or we’ll email you a magic link.
							</p>
						</CardHeader>
						<CardContent className="grid gap-5 p-6">
							<Button variant="outline" disabled={isOAuthLoading} onClick={signInWithGoogle} className="w-full justify-between">
								<span>{isOAuthLoading ? "Connecting..." : "Continue with Google"}</span>
								<ArrowRight className="h-4 w-4" />
							</Button>

							<div className="flex items-center gap-3">
								<div className="h-px flex-1 bg-border" />
								<span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">or</span>
								<div className="h-px flex-1 bg-border" />
							</div>

							<div className="rounded-[calc(var(--radius)+2px)] border border-border/70 bg-background/70 p-4">
								<div className="grid gap-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="you@company.com"
										inputMode="email"
										autoComplete="email"
									/>
								</div>
								<Button className="mt-4 w-full justify-between" disabled={!canSend || isSending} onClick={sendMagicLink}>
									<span>{sent ? "Link sent" : isSending ? "Sending..." : "Send magic link"}</span>
									<ArrowRight className="h-4 w-4" />
								</Button>
							</div>

							{error ? <InlineMessage variant="error">{error}</InlineMessage> : null}
							{sent ? (
								<InlineMessage variant="success">
									Check your inbox and open the link to finish signing in.
								</InlineMessage>
							) : null}

							<p className="text-xs leading-6 text-muted-foreground">
								By continuing, you agree to our{" "}
								<Link className="underline underline-offset-4" href="/terms">
									Terms
								</Link>
								{" "}and{" "}
								<Link className="underline underline-offset-4" href="/privacy">
									Privacy Policy
								</Link>
								.{" "}
								<Link className="underline underline-offset-4" href="/pricing">
									See pricing
								</Link>
								.
							</p>
						</CardContent>
					</Card>
				</div>
			</PageShell>
		</div>
	);
}
