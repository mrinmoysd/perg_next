import Link from "next/link";
import {
	ArrowRight,
	BookmarkCheck,
	CheckCircle2,
	Layers,
	PencilLine,
	ShieldCheck,
	Sparkles,
	UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { PublicHeader } from "@/components/marketing/PublicHeader";

export default function Home() {
	return (
		<div className="min-h-dvh bg-background">
			<PublicHeader active="home" />

			<main id="main" className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 top-[-180px] -z-10 mx-auto h-[520px] w-full max-w-6xl bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.18),_transparent_55%)]"
				/>

				<section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
					<div className="max-w-2xl">
						<Badge variant="secondary">Fast replies, refined voice</Badge>
						<h1 className="mt-5 text-5xl font-semibold leading-[0.96] tracking-tight text-foreground sm:text-6xl">
							Make every inbox reply sound measured, clear, and ready to send.
						</h1>
						<p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
							PERG turns messy incoming email into a polished response loop: choose a tone, generate a draft, tweak it, save what works, and reuse it later.
						</p>
						<div className="mt-7 flex flex-wrap items-center gap-3">
							<Button asChild size="lg">
								<Link href="/login">
									Try it free
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link href="/pricing">View pricing</Link>
							</Button>
						</div>
						<div className="mt-8 flex flex-wrap gap-5 text-sm text-muted-foreground">
							<div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Signature-aware replies</div>
							<div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> In-session variations</div>
							<div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Searchable history</div>
						</div>
					</div>

					<Card className="overflow-hidden border-primary/15 bg-card/95">
						<CardHeader className="border-b border-border/70 bg-secondary/35">
							<div className="flex items-center justify-between gap-3">
								<div>
									<CardTitle>Live workflow preview</CardTitle>
									<p className="mt-2 text-sm text-muted-foreground">Input, generate, polish, send.</p>
								</div>
								<Badge>Professional</Badge>
							</div>
						</CardHeader>
						<CardContent className="grid gap-4 p-5">
							<div className="rounded-[calc(var(--radius)-2px)] border border-border/80 bg-background p-4 shadow-sm">
								<p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Incoming email</p>
								<p className="mt-3 text-sm leading-6">
									Hey, can we move our meeting to Thursday? I am blocked until I hear back from your team and need to confirm next steps by EOD.
								</p>
							</div>
							<div className="rounded-[calc(var(--radius)-2px)] border border-primary/15 bg-primary/[0.04] p-4">
								<p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Generated reply</p>
								<p className="mt-3 text-sm leading-6">
									Thursday works for me. If you share the blocker and your preferred time, I will confirm the meeting and help move the next step forward before end of day.
									<br />
									<br />
									Best,
									<br />
									Alex
								</p>
							</div>
							<div className="grid gap-3 rounded-[calc(var(--radius)-2px)] border border-border/70 bg-background/70 p-4 sm:grid-cols-3">
								<div>
									<div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Tone</div>
									<div className="mt-1 text-sm font-semibold">Professional</div>
								</div>
								<div>
									<div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Length</div>
									<div className="mt-1 text-sm font-semibold">Medium</div>
								</div>
								<div>
									<div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Output time</div>
									<div className="mt-1 text-sm font-semibold">&lt; 10 seconds</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</section>

				<Separator className="my-12" />

				<section className="rounded-[calc(var(--radius)+8px)] border border-border/70 bg-card/80 p-6 shadow-[0_12px_28px_-26px_rgba(15,23,42,0.4)]">
					<div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
						<div>
							<div className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Built for repeat use</div>
							<p className="mt-2 max-w-2xl text-base text-foreground">
								Best for founders, operators, recruiters, sales teams, and client-facing roles that need fast replies without losing tone.
							</p>
						</div>
						<div className="grid min-w-[240px] gap-3 text-sm sm:grid-cols-3">
							<div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
								<div className="text-2xl font-semibold text-foreground">10s</div>
								<div className="text-muted-foreground">reply loop</div>
							</div>
							<div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
								<div className="text-2xl font-semibold text-foreground">1 click</div>
								<div className="text-muted-foreground">save or copy</div>
							</div>
							<div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
								<div className="text-2xl font-semibold text-foreground">daily</div>
								<div className="text-muted-foreground">quota visibility</div>
							</div>
						</div>
					</div>
				</section>

				<section aria-label="Features" className="mt-12 grid gap-10">
					<div className="mx-auto max-w-2xl text-center">
						<Badge variant="secondary">Features</Badge>
						<h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
							A tighter workflow than generic AI writing tools.
						</h2>
						<p className="mt-4 text-base leading-7 text-muted-foreground">
							Every surface is built around one core loop: generate, refine, save, and reuse.
						</p>
					</div>

					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<Card className="bg-card/88">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Sparkles className="h-4 w-4 text-primary" />
									Fast generation
								</CardTitle>
								<p className="mt-2 text-sm text-muted-foreground">Paste → choose tone/length → generate.</p>
							</CardHeader>
							<CardContent className="text-sm text-muted-foreground">
								Optimized for time-to-value, so you can respond in minutes instead of stalling on wording.
							</CardContent>
						</Card>

						<Card className="bg-card/88">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<PencilLine className="h-4 w-4 text-primary" />
									Editable replies
								</CardTitle>
								<p className="mt-2 text-sm text-muted-foreground">Tweak the output before you send it.</p>
							</CardHeader>
							<CardContent className="text-sm text-muted-foreground">
								Keep full control over the final message without having to start from scratch.
							</CardContent>
						</Card>

						<Card className="bg-card/88">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Layers className="h-4 w-4 text-primary" />
									Variations
								</CardTitle>
								<p className="mt-2 text-sm text-muted-foreground">Generate multiple options for the same email.</p>
							</CardHeader>
							<CardContent className="text-sm text-muted-foreground">
								Switch between versions without losing your place or the context you started from.
							</CardContent>
						</Card>

						<Card className="bg-card/88">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<BookmarkCheck className="h-4 w-4 text-primary" />
									Save + history
								</CardTitle>
								<p className="mt-2 text-sm text-muted-foreground">Keep what works, reuse later.</p>
							</CardHeader>
							<CardContent className="text-sm text-muted-foreground">
								Save good responses and revisit past generations from a dedicated history view.
							</CardContent>
						</Card>

						<Card className="bg-card/88">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<UserRound className="h-4 w-4 text-primary" />
									Profile defaults
								</CardTitle>
								<p className="mt-2 text-sm text-muted-foreground">Your tone and signature, remembered.</p>
							</CardHeader>
							<CardContent className="text-sm text-muted-foreground">
								Set your signature and preferred tone once so every reply feels consistent.
							</CardContent>
						</Card>

						<Card className="bg-card/88">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<ShieldCheck className="h-4 w-4 text-primary" />
									Quota transparency
								</CardTitle>
								<p className="mt-2 text-sm text-muted-foreground">Know exactly what you have left today.</p>
							</CardHeader>
							<CardContent className="text-sm text-muted-foreground">
								Free usage remains visible and the upgrade path is there when you need more capacity.
							</CardContent>
						</Card>
					</div>
				</section>

				<Separator className="my-12" />

				<section className="rounded-[calc(var(--radius)+10px)] border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-secondary/45 p-8 shadow-[0_18px_30px_-28px_hsl(var(--primary)/0.6)]">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ready to make your inbox feel lighter?</h2>
						<p className="mt-3 text-base leading-7 text-muted-foreground">
							Sign in, paste an email, and turn it into a polished reply in under a minute.
						</p>
						<div className="mt-6 flex flex-wrap justify-center gap-3">
							<Button asChild size="lg">
								<Link href="/login">Get started</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link href="/pricing">See pricing</Link>
							</Button>
						</div>
					</div>
				</section>
			</main>

			<PublicFooter />
		</div>
	);
}
