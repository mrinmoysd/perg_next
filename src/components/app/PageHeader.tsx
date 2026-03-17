import { cn } from "@/lib/utils";

export function PageHeader({
	title,
	description,
	actions,
	className,
}: {
	title: string;
	description?: string;
	actions?: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("flex flex-col gap-4 rounded-[calc(var(--radius)+6px)] border border-border/70 bg-card/72 p-5 shadow-[0_12px_24px_-24px_rgba(15,23,42,0.45)] backdrop-blur sm:flex-row sm:items-start sm:justify-between sm:p-6", className)}>
			<div className="min-w-0">
				<h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
				{description ? (
					<p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
				) : null}
			</div>
			{actions ? <div className="shrink-0 pt-1">{actions}</div> : null}
		</div>
	);
}
