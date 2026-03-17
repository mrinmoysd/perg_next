"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, CreditCard, LogOut, Mail, Menu, Moon, Settings, Sun, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme/ThemeProvider";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type NavItem = {
	href: string;
	label: string;
	icon: React.ReactNode;
	description: string;
};

const navItems: NavItem[] = [
	{ href: "/dashboard", label: "Dashboard", icon: <Mail className="h-4 w-4" />, description: "Generate and refine replies" },
	{ href: "/history", label: "History", icon: <Clock className="h-4 w-4" />, description: "Search previous generations" },
	{ href: "/settings/profile", label: "Profile", icon: <User className="h-4 w-4" />, description: "Defaults and signature" },
	{ href: "/settings/billing", label: "Billing", icon: <CreditCard className="h-4 w-4" />, description: "Plan and subscription" },
];

function NavLink({
	href,
	children,
	description,
}: {
	href: string;
	children: React.ReactNode;
	description: string;
}) {
	const pathname = usePathname();
	const active = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));

	return (
		<Link
			href={href}
			className={cn(
				"group relative flex items-center gap-3 rounded-[calc(var(--radius)-4px)] px-4 py-3 text-sm transition-all duration-200",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				active
					? "bg-secondary text-foreground shadow-sm"
					: "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
			)}
		>
			<span
				aria-hidden
				className={cn(
					"grid h-9 w-9 place-items-center rounded-2xl transition-colors",
					active ? "bg-primary text-primary-foreground" : "bg-background/75 text-foreground"
				)}
			>
				{children}
			</span>
			<span className="flex min-w-0 flex-col">
				<span className="font-medium tracking-tight">{navItems.find((item) => item.href === href)?.label}</span>
				<span className="truncate text-xs text-muted-foreground">{description}</span>
			</span>
		</Link>
	);
}

export function AppShell({ children }: { children: React.ReactNode }) {
	const { theme, toggleTheme } = useTheme();

	async function onLogout() {
		await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
		window.location.assign("/login");
	}

	const userMenu = (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Open user menu">
					<User className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/settings/profile">
						<Settings className="h-4 w-4" />
						Settings
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/settings/billing">
						<CreditCard className="h-4 w-4" />
						Billing
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onSelect={(e) => {
						e.preventDefault();
						toggleTheme();
					}}
				>
					{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
					Theme: {theme === "dark" ? "Dark" : "Light"}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onSelect={(e) => {
						e.preventDefault();
						onLogout();
					}}
				>
					<LogOut className="h-4 w-4" />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);

	return (
		<div className="min-h-dvh bg-background">
			<div className="mx-auto flex w-full max-w-[1540px]">
				<aside className="hidden w-80 shrink-0 border-r border-border/70 bg-card/58 px-5 py-6 backdrop-blur md:block">
					<div className="flex items-start justify-between gap-3">
						<Link href="/dashboard" className="flex items-center gap-3">
							<span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_16px_28px_-18px_hsl(var(--primary)/0.8)]">
								<Mail className="h-4 w-4" aria-hidden />
							</span>
							<span className="flex flex-col">
								<span className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">Workspace</span>
								<span className="text-base font-semibold tracking-tight text-foreground">PERG</span>
							</span>
						</Link>
						<div className="flex items-center gap-1">
							{userMenu}
							<Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
								{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
							</Button>
						</div>
					</div>

					<Separator className="my-6" />

					<div className="rounded-[calc(var(--radius)+2px)] border border-border/70 bg-background/70 p-3 shadow-sm">
						<div className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Main navigation</div>
						<nav className="mt-3 grid gap-2" aria-label="Primary navigation">
							{navItems.map((item) => (
								<NavLink key={item.href} href={item.href} description={item.description}>
									{item.icon}
								</NavLink>
							))}
						</nav>
					</div>
				</aside>

				<div className="min-w-0 flex-1">
					<header className="flex items-center justify-between border-b border-border/70 bg-card/70 px-4 py-3 backdrop-blur md:hidden">
						<div className="flex items-center gap-3">
							<Sheet>
								<SheetTrigger asChild>
									<Button variant="ghost" size="icon" aria-label="Open navigation">
										<Menu className="h-5 w-5" />
									</Button>
								</SheetTrigger>
								<SheetContent side="left" className="border-border/70 bg-card/95 p-0 backdrop-blur">
									<div className="p-6">
										<SheetHeader>
											<SheetTitle>
												<Link href="/dashboard" className="flex items-center gap-3">
													<span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
														<Mail className="h-4 w-4" aria-hidden />
													</span>
													<span className="font-semibold tracking-tight">PERG</span>
												</Link>
											</SheetTitle>
										</SheetHeader>
									</div>
									<Separator />
									<nav className="grid gap-2 p-3" aria-label="Primary navigation">
										{navItems.map((item) => (
											<NavLink key={item.href} href={item.href} description={item.description}>
												{item.icon}
											</NavLink>
										))}
									</nav>
								</SheetContent>
							</Sheet>
							<Link href="/dashboard" className="flex items-center gap-3 text-sm font-semibold">
								<span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground">
									<Mail className="h-4 w-4" aria-hidden />
								</span>
								<span>PERG</span>
							</Link>
						</div>
						<div className="flex items-center gap-1">
							{userMenu}
							<Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
								{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
							</Button>
						</div>
					</header>
					<main id="main" className="min-w-0">
						{children}
					</main>
				</div>
			</div>
		</div>
	);
}
