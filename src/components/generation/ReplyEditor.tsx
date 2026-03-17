"use client";

import { useMemo, useState } from "react";
import { Copy, Eye, PencilLine, RefreshCcw, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Mode = "edit" | "preview";

export function ReplyEditor({
	value,
	onChange,
	onCopy,
	onToggleSaved,
	onRegenerate,
	canCopy,
	canSave,
	canRegenerate,
	isSaved,
	isBusy,
	className,
}: {
	value: string;
	onChange: (next: string) => void;
	onCopy: () => Promise<void> | void;
	onToggleSaved: () => Promise<void> | void;
	onRegenerate: () => Promise<void> | void;
	canCopy: boolean;
	canSave: boolean;
	canRegenerate: boolean;
	isSaved: boolean;
	isBusy: boolean;
	className?: string;
}) {
	const [mode, setMode] = useState<Mode>("edit");

	const previewLines = useMemo(
		() => value.split("\n").map((l) => l.trimEnd()),
		[value]
	);

	return (
		<div className={cn("grid gap-4", className)}>
			<div className="flex flex-col gap-3 rounded-[calc(var(--radius)+2px)] border border-border/70 bg-background/72 p-3 sm:flex-row sm:items-center sm:justify-between">
				<Label className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Reply</Label>
				<div className="flex flex-wrap items-center gap-2">
					<Button
						variant={mode === "edit" ? "secondary" : "outline"}
						size="sm"
						onClick={() => setMode("edit")}
					>
						<PencilLine className="h-4 w-4" />
						Edit
					</Button>
					<Button
						variant={mode === "preview" ? "secondary" : "outline"}
						size="sm"
						onClick={() => setMode("preview")}
					>
						<Eye className="h-4 w-4" />
						Preview
					</Button>

					<div className="mx-1 hidden h-6 w-px bg-border sm:block" />

					<Button
						variant="default"
						size="sm"
						disabled={!canCopy}
						onClick={() => onCopy()}
					>
						<Copy className="h-4 w-4" />
						Copy
					</Button>
					<Button
						variant={isSaved ? "secondary" : "outline"}
						size="sm"
						disabled={!canSave}
						onClick={() => onToggleSaved()}
					>
						<Star className={cn("h-4 w-4", isSaved && "fill-current")} />
						{isSaved ? "Saved" : "Save"}
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={!canRegenerate || isBusy}
						onClick={() => onRegenerate()}
					>
						<RefreshCcw className="h-4 w-4" />
						Regenerate
					</Button>
				</div>
			</div>

			{mode === "edit" ? (
				<Textarea
					className="min-h-[260px] rounded-[calc(var(--radius)-2px)] border-border/80 bg-background/90"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder="Your reply will appear here..."
				/>
			) : (
				<div className="min-h-[260px] rounded-[calc(var(--radius)-2px)] border border-border/80 bg-muted/30 p-5 text-sm leading-7">
					{previewLines.map((line, i) => (
						<p key={i} className={cn("whitespace-pre-wrap", line ? "" : "h-4")}>
							{line || "\u00A0"}
						</p>
					))}
				</div>
			)}

			<p className="text-xs text-muted-foreground">
				Edits are local and won’t change history (yet).
			</p>
		</div>
	);
}
