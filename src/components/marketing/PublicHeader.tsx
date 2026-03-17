import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PublicHeader({
	active,
	className,
}: {
	active?: "home" | "pricing" | "help";
	className?: string;
}) {
	return (
		<header className={cn("sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl", className)}>
			<div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
				<Link href="/" className="flex items-center gap-3 text-sm font-semibold">
					<span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_14px_28px_-18px_hsl(var(--primary)/0.9)]">P</span>
					<span className="flex flex-col">
						<span className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">Inbox AI</span>
						<span className="text-base tracking-tight">PERG</span>
					</span>
				</Link>
				<div className="flex items-center gap-2">
					<nav className="hidden items-center gap-1 rounded-full border border-border/70 bg-card/80 p-1 shadow-sm md:flex" aria-label="Primary">
						<Button asChild variant="ghost" size="sm">
							<Link
								href="/"
								className={cn(
									"relative rounded-full px-4",
									active === "home" &&
										"bg-secondary text-foreground"
								)}
							>
								Home
							</Link>
						</Button>
						<Button asChild variant="ghost" size="sm">
							<Link
								href="/pricing"
								className={cn(
									"relative rounded-full px-4",
									active === "pricing" &&
										"bg-secondary text-foreground"
								)}
							>
								Pricing
							</Link>
						</Button>
						<Button asChild variant="ghost" size="sm">
							<Link
								href="/help"
								className={cn(
									"relative rounded-full px-4",
									active === "help" &&
										"bg-secondary text-foreground"
								)}
							>
								Help
							</Link>
						</Button>
					</nav>
					<Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
						<Link href="/login">Sign in</Link>
					</Button>
					<Button asChild size="sm" className="shadow-[0_16px_28px_-18px_hsl(var(--primary)/0.8)]">
						<Link href="/login">Try it free</Link>
					</Button>
				</div>
			</div>
		</header>
	);
}
