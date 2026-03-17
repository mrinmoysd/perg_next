import { cn } from "@/lib/utils";

export function EmptyState({
	title,
	description,
	action,
	className,
}: {
	title: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("rounded-xl border bg-card p-8 text-center", className)}>
			<h3 className="text-base font-semibold">{title}</h3>
			{description ? (
				<p className="mt-2 text-sm text-muted-foreground">{description}</p>
			) : null}
			{action ? <div className="mt-5 flex justify-center">{action}</div> : null}
		</div>
	);
}
