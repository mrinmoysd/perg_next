import Link from "next/link";

import { cn } from "@/lib/utils";

export function PublicFooter({ className }: { className?: string }) {
	return (
		<footer className={cn("border-t border-border/70 bg-card/65 backdrop-blur", className)}>
			<div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 text-sm text-muted-foreground sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
				<div className="max-w-md">
					<div className="flex items-center gap-3 text-foreground">
						<span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">P</span>
						<div>
							<div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Personalized Email Reply Generator</div>
							<div className="text-base font-semibold tracking-tight">PERG</div>
						</div>
					</div>
					<p className="mt-4 leading-6">
						AI-assisted replies for people who live in their inbox and care how they sound.
					</p>
				</div>
				<div className="flex flex-col gap-4 sm:items-end">
					<div className="flex flex-wrap items-center gap-x-5 gap-y-2">
						<Link className="transition-colors hover:text-foreground" href="/help">
							Help
						</Link>
						<Link className="transition-colors hover:text-foreground" href="/privacy">
							Privacy
						</Link>
						<Link className="transition-colors hover:text-foreground" href="/terms">
							Terms
						</Link>
						<Link className="transition-colors hover:text-foreground" href="/pricing">
							Pricing
						</Link>
						<Link className="transition-colors hover:text-foreground" href="/login">
							Try it free
						</Link>
					</div>
					<p>© {new Date().getFullYear()} PERG. Built for fast, polished replies.</p>
				</div>
			</div>
		</footer>
	);
}
