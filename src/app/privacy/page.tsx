import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { PublicHeader } from "@/components/marketing/PublicHeader";

export const metadata: Metadata = {
	title: "Privacy",
	description: "Privacy policy for PERG — Personalized Email Reply Generator.",
};

export default function PrivacyPage() {
	return (
		<div className="min-h-dvh bg-background">
			<PublicHeader />

			<main id="main" className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
				<div className="mx-auto max-w-4xl">
					<Badge variant="secondary">Privacy</Badge>
					<h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">Privacy policy</h1>
					<p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
						This is the launch version of the policy. Replace placeholders with your real company details and have counsel review it before production rollout.
					</p>

					<Card className="mt-8 bg-card/94">
						<CardContent className="prose prose-slate max-w-none pt-8 leading-7 dark:prose-invert">
							<h2>What we collect</h2>
							<ul>
								<li><strong>Account info</strong>: email address and profile fields you provide, such as name, company, and signature.</li>
								<li><strong>Generation history</strong>: the email text you paste and the replies generated for you, so you can search and reuse them.</li>
								<li><strong>Usage data</strong>: plan, quota usage, and billing identifiers.</li>
							</ul>

							<h2>How we use data</h2>
							<ul>
								<li>Provide the service, including generation, history, and quota enforcement.</li>
								<li>Operate billing and prevent abuse.</li>
								<li>Improve reliability through logs and monitoring.</li>
							</ul>

							<h2>Data retention</h2>
							<p>
								Your history is retained until you delete it or delete your account. You can request deletion through the in-app account deletion flow.
							</p>

							<h2>Third parties</h2>
							<p>
								We use third-party providers for authentication (Supabase), billing (Stripe), and AI generation. These providers process data as needed to provide their services.
							</p>

							<h2>Your choices</h2>
							<ul>
								<li>Update your profile and defaults in Settings.</li>
								<li>Delete your account and associated data in Settings.</li>
							</ul>

							<h2>Contact</h2>
							<p>
								Questions? Email <strong>privacy@perg.app</strong>.
							</p>
						</CardContent>
					</Card>
				</div>
			</main>

			<PublicFooter />
		</div>
	);
}
