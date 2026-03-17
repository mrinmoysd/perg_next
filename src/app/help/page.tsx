import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { PublicHeader } from "@/components/marketing/PublicHeader";

export const metadata: Metadata = {
	title: "Help",
	description: "Help and FAQs for PERG — Personalized Email Reply Generator.",
};

export default function HelpPage() {
	return (
		<div className="min-h-dvh bg-background">
			<PublicHeader active="help" />

			<main id="main" className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 top-[-180px] -z-10 mx-auto h-[520px] w-full max-w-6xl bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.18),_transparent_55%)]"
				/>
				<div className="mx-auto max-w-2xl text-center">
					<Badge variant="secondary">Help</Badge>
					<h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">Answers for the moments you get stuck.</h1>
					<p className="mt-4 text-lg leading-8 text-muted-foreground">
						Quick guidance for login, generation, billing, and stored history. If you still need help, contact us directly.
					</p>
				</div>

				<Separator className="my-12" />

				<section className="mx-auto max-w-4xl">
					<h2 className="text-3xl font-semibold tracking-tight">FAQ</h2>
					<div className="mt-6 grid gap-4">
						{[
							["How does PERG work?", "Paste an email, pick a tone and length, and PERG generates a reply you can edit, copy, save, and revisit later."],
							["Do you store my emails?", "Your generation history is stored so you can search and reuse replies. You can delete your account at any time from Settings → Profile."],
							["What are the free limits?", "Free includes a daily reply limit. If you hit it, upgrade to Pro from Billing to unlock a higher allowance."],
							["The magic link isn’t arriving. What should I do?", "Check spam or promotions first, then try again. If it still doesn’t arrive, use Google sign-in or contact support."],
						].map(([title, body]) => (
							<Card key={title}>
								<CardHeader>
									<CardTitle className="text-lg">{title}</CardTitle>
								</CardHeader>
								<CardContent className="text-sm leading-7 text-muted-foreground">{body}</CardContent>
							</Card>
						))}
					</div>
				</section>

				<section className="mx-auto mt-12 max-w-4xl">
					<h2 className="text-3xl font-semibold tracking-tight">Contact</h2>
					<Card className="mt-6 bg-card/90">
						<CardContent className="grid gap-3 pt-6 text-sm leading-7 text-muted-foreground">
							<p>
								Email us at <span className="font-semibold text-foreground">support@perg.app</span> and include the issue, page, and anything you already tried.
							</p>
							<p>
								For billing questions, visit <Link className="underline underline-offset-4" href="/pricing">Pricing</Link>.
							</p>
						</CardContent>
					</Card>
				</section>
			</main>

			<PublicFooter />
		</div>
	);
}
