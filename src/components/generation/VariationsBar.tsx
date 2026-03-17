"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type VariationItem = {
	id: string;
	created_at: string;
	is_saved: boolean;
};

function formatShort(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleString(undefined, {
		month: "short",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function VariationsBar({
	items,
	activeId,
	onSelect,
	className,
}: {
	items: VariationItem[];
	activeId: string | null;
	onSelect: (id: string) => void;
	className?: string;
}) {
	if (!items.length) return null;

	return (
		<div className={cn("flex flex-col gap-3 rounded-[calc(var(--radius)+2px)] border border-border/70 bg-background/75 p-4 shadow-sm", className)}>
			<div className="flex items-center justify-between gap-3">
				<div className="text-sm font-semibold">Variations</div>
				<div className="text-xs text-muted-foreground">Newest first</div>
			</div>
			<div className="flex flex-wrap gap-2">
				{items.map((v, idx) => {
					const label = idx === 0 ? "Latest" : `Var ${idx + 1}`;
					const active = v.id === activeId;
					return (
						<Button
							key={v.id}
							variant={active ? "default" : "outline"}
							size="sm"
							onClick={() => onSelect(v.id)}
							className={cn("gap-2", !active && "bg-background")}
							title={formatShort(v.created_at)}
						>
							<span>{label}</span>
							{v.is_saved ? <Badge variant="secondary">Saved</Badge> : null}
						</Button>
					);
				})}
			</div>
		</div>
	);
}
