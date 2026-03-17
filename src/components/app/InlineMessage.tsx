import { cn } from "@/lib/utils";

type Variant = "info" | "success" | "error";

const styles: Record<Variant, string> = {
	info: "border-border bg-card",
	success: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-50",
	error: "border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-50",
};

export function InlineMessage({
	variant,
	children,
	className,
}: {
	variant: Variant;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"rounded-[calc(var(--radius)-4px)] border px-4 py-3 text-sm shadow-sm",
				styles[variant],
				className
			)}
		>
			{children}
		</div>
	);
}
