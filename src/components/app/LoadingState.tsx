import { cn } from "@/lib/utils";

export function LoadingState({
	label = "Loading...",
	className,
}: {
	label?: string;
	className?: string;
}) {
	return (
		<div className={cn("rounded-[calc(var(--radius)-4px)] border border-border/70 bg-background/72 px-4 py-3 text-sm text-muted-foreground shadow-sm", className)}>{label}</div>
	);
}
