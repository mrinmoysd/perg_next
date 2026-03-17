"use client";

import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type GenerationListItemModel = {
	id: string;
	email_input: string;
	tone: string;
	length: string;
	ai_reply: string;
	is_saved: boolean;
	created_at: string;
};

function formatWhenShort(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleString(undefined, {
		month: "short",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function excerpt(text: string, max = 120) {
	const t = text.replace(/\s+/g, " ").trim();
	if (t.length <= max) return t;
	return `${t.slice(0, max)}…`;
}

export function GenerationListItem({
	item,
	selected,
	onSelect,
	onToggleSaved,
	className,
}: {
	item: GenerationListItemModel;
	selected: boolean;
	onSelect: () => void;
	onToggleSaved: () => void;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"group rounded-[calc(var(--radius)+2px)] border border-border/70 bg-card/85 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/25",
				selected && "border-primary/35 bg-accent/25 shadow-[0_18px_28px_-26px_hsl(var(--primary)/0.7)]",
				className
			)}
		>
			<button
				type="button"
				onClick={onSelect}
				className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-sm font-medium">{formatWhenShort(item.created_at)}</span>
							{item.is_saved ? (
								<Badge variant="secondary" className="gap-1">
									<Star className="h-3.5 w-3.5 fill-current" />
									Saved
								</Badge>
							) : null}
						</div>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">{excerpt(item.email_input)}</p>
						<div className="mt-2 flex flex-wrap gap-2">
							<Badge variant="outline">Tone: {item.tone}</Badge>
							<Badge variant="outline">Len: {item.length}</Badge>
						</div>
					</div>
					<div className="shrink-0">
						<Button
							variant="ghost"
							size="icon"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onToggleSaved();
							}}
							aria-label={item.is_saved ? "Unsave" : "Save"}
							className="opacity-70 transition-opacity group-hover:opacity-100"
						>
							<Star className={cn("h-4 w-4", item.is_saved && "fill-current text-primary")} />
						</Button>
					</div>
				</div>
			</button>
		</div>
	);
}
