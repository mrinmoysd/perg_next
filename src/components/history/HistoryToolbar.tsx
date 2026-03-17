"use client";

import { Search } from "lucide-react";

import { Toolbar } from "@/components/app/Toolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function HistoryToolbar({
	query,
	onQueryChange,
	savedOnly,
	onSavedOnlyChange,
	onRefresh,
	isRefreshing,
	className,
}: {
	query: string;
	onQueryChange: (next: string) => void;
	savedOnly: boolean | null;
	onSavedOnlyChange: (next: boolean | null) => void;
	onRefresh: () => void;
	isRefreshing: boolean;
	className?: string;
}) {
	return (
		<Toolbar className={cn("gap-3 rounded-[calc(var(--radius)+2px)] border border-border/70 bg-background/72 p-3 shadow-sm", className)}>
			<div className="relative w-full sm:max-w-md">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					value={query}
					onChange={(e) => onQueryChange(e.target.value)}
					placeholder="Search history…"
					className="h-11 rounded-full border-border/80 bg-card/80 pl-9"
					aria-label="Search history"
				/>
			</div>

			<div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
				<Tabs value={savedOnly === true ? "saved" : savedOnly === false ? "all" : "any"}>
					<TabsList>
						<TabsTrigger value="any" onClick={() => onSavedOnlyChange(null)}>
							Any
						</TabsTrigger>
						<TabsTrigger value="saved" onClick={() => onSavedOnlyChange(true)}>
							Saved
						</TabsTrigger>
						<TabsTrigger value="all" onClick={() => onSavedOnlyChange(false)}>
							Unsaved
						</TabsTrigger>
					</TabsList>
				</Tabs>

				<Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
					{isRefreshing ? "Refreshing…" : "Refresh"}
				</Button>
			</div>
		</Toolbar>
	);
}
