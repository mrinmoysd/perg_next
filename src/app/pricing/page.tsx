import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { PublicHeader } from "@/components/marketing/PublicHeader";

export default function PricingPage() {
	return (
		<div className="min-h-dvh bg-background">
			<PublicHeader active="pricing" />

			<main id="main" className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 top-[-180px] -z-10 mx-auto h-[520px] w-full max-w-6xl bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.18),_transparent_55%)]"
				/>

				<div className="mx-auto max-w-2xl text-center">
					<Badge variant="secondary">Straightforward pricing</Badge>
					<h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">Start free, upgrade only when the inbox gets heavy.</h1>
					<p className="mt-4 text-lg leading-8 text-muted-foreground">
						The free plan is enough to feel the workflow. Pro is there when replies become part of your daily operating system.
					</p>
				</div>

				<div className="mt-12 grid gap-5 lg:grid-cols-2">
					<Card className="bg-card/88">
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span>Free</span>
								<Badge variant="secondary">Great for starting</Badge>
							</CardTitle>
							<p className="mt-2 text-sm text-muted-foreground">For occasional replies and early evaluation.</p>
						</CardHeader>
						<CardContent className="grid gap-4">
							<div>
								<div className="text-4xl font-semibold tracking-tight">$0</div>
								<div className="mt-1 text-sm text-muted-foreground">No card required.</div>
							</div>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4" /> Daily reply limit</li>
								<li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4" /> History + saved replies</li>
								<li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4" /> Tone + length controls</li>
							</ul>
							<Button asChild variant="outline">
								<Link href="/login">Try it free</Link>
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
								<Badge>Recommended</Badge>
							</CardTitle>
							<p className="mt-2 text-sm text-muted-foreground">For people who answer email all day and want a smoother loop.</p>
						</CardHeader>
						<CardContent className="grid gap-4">
							<div>
								<div className="text-4xl font-semibold tracking-tight">Pro</div>
								<div className="mt-1 text-sm text-muted-foreground">Upgrade from Billing after sign-in.</div>
							</div>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary" /> Higher daily limits</li>
								<li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary" /> History + saved workflow</li>
								<li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary" /> Stripe checkout + automatic updates</li>
							</ul>
							<Button asChild>
								<Link href="/login?next=/settings/billing">Upgrade to Pro</Link>
							</Button>
							<p className="text-xs text-muted-foreground">
								You can upgrade any time from Billing after signing in.
							</p>
						</CardContent>
					</Card>
				</div>

				<Separator className="my-12" />

				<section className="mx-auto max-w-3xl">
					<h2 className="text-3xl font-semibold tracking-tight">FAQ</h2>
					<div className="mt-6 grid gap-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Do you store my email content?</CardTitle>
							</CardHeader>
							<CardContent className="text-sm text-muted-foreground">
								Your input is used to generate your reply. Your generation history is stored so you can search and reuse replies.
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Can I cancel Pro?</CardTitle>
							</CardHeader>
							<CardContent className="text-sm text-muted-foreground">
								Yes. Manage your plan any time from Billing.
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Will my plan update immediately?</CardTitle>
							</CardHeader>
							<CardContent className="text-sm text-muted-foreground">
								After successful payment, we sync plan state via Stripe webhooks. It may take a moment to reflect.
							</CardContent>
						</Card>
					</div>
				</section>
			</main>

			<PublicFooter />
		</div>
	);
}
