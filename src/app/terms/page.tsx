import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { PublicHeader } from "@/components/marketing/PublicHeader";

export const metadata: Metadata = {
	title: "Terms",
	description: "Terms of service for PERG — Personalized Email Reply Generator.",
};

export default function TermsPage() {
	return (
		<div className="min-h-dvh bg-background">
			<PublicHeader />

			<main id="main" className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
				<div className="mx-auto max-w-4xl">
					<Badge variant="secondary">Terms</Badge>
					<h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">Terms of service</h1>
					<p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
						This is the launch version of the terms. Replace placeholders with your actual company name, address, and jurisdiction before shipping.
					</p>

					<Card className="mt-8 bg-card/94">
						<CardContent className="prose prose-slate max-w-none pt-8 leading-7 dark:prose-invert">
							<h2>Using the service</h2>
							<p>
								You may use PERG to generate email replies. You are responsible for reviewing any output before sending it.
							</p>

							<h2>Accounts</h2>
							<p>
								You must provide a valid email address to create an account and keep your account secure.
							</p>

							<h2>Acceptable use</h2>
							<ul>
								<li>No abuse, scraping, or attempts to bypass quota limits.</li>
								<li>No unlawful use of the product or generated output.</li>
							</ul>

							<h2>Billing</h2>
							<p>
								Paid subscriptions are processed by Stripe. You can manage or cancel from the Billing page and Stripe customer portal when enabled.
							</p>

							<h2>Termination</h2>
							<p>
								You may delete your account at any time in Settings. We may suspend accounts for abuse or violations of these terms.
							</p>

							<h2>Contact</h2>
							<p>
								Questions? Email <strong>support@perg.app</strong>.
							</p>
						</CardContent>
					</Card>
				</div>
			</main>

			<PublicFooter />
		</div>
	);
}
