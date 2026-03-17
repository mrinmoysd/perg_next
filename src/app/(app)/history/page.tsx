"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/app/PageShell";
import { PageHeader } from "@/components/app/PageHeader";
import { InlineMessage } from "@/components/app/InlineMessage";
import { EmptyState } from "@/components/app/EmptyState";
import { LoadingState } from "@/components/app/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenerationListItem } from "@/components/history/GenerationListItem";
import { HistoryToolbar } from "@/components/history/HistoryToolbar";

type GenerationItem = {
	id: string;
	email_input: string;
	tone: string;
	length: string;
	ai_reply: string;
	ai_model: string | null;
	status: string;
	is_saved: boolean;
	created_at: string;
};

export default function HistoryPage() {
	const [items, setItems] = useState<GenerationItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [savedOnly, setSavedOnly] = useState<boolean | null>(null);
	const [selected, setSelected] = useState<GenerationItem | null>(null);
	const [query, setQuery] = useState("");
	const [regenStatus, setRegenStatus] = useState<string | null>(null);

	const filtered = useMemo(() => items, [items]);

	async function load() {
		setIsLoading(true);
		setError(null);
		setSelected(null);
		try {
			const params = new URLSearchParams();
			params.set("limit", "50");
			if (savedOnly === true) params.set("saved", "true");
			if (savedOnly === false) params.set("saved", "false");
			const q = query.trim();
			if (q) params.set("q", q);

			const res = await fetch(`/api/generations?${params.toString()}`);
			const json: unknown = await res.json();
			const j = (json && typeof json === "object") ? (json as Record<string, unknown>) : {};
			if (!res.ok) throw new Error(typeof j.error === "string" ? j.error : "Failed to load history");

			const raw = Array.isArray(j.items) ? (j.items as unknown[]) : [];
			const parsed = raw
				.map((x) => (x && typeof x === "object") ? (x as Record<string, unknown>) : null)
				.filter(Boolean)
				.map((x) => ({
					id: String(x!.id ?? ""),
					email_input: String(x!.email_input ?? ""),
					tone: String(x!.tone ?? ""),
					length: String(x!.length ?? ""),
					ai_reply: String(x!.ai_reply ?? ""),
					ai_model: typeof x!.ai_model === "string" ? x!.ai_model : null,
					status: String(x!.status ?? ""),
					is_saved: Boolean(x!.is_saved),
					created_at: String(x!.created_at ?? ""),
				}))
				.filter((x) => !!x.id);

			setItems(parsed);
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Failed to load");
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [savedOnly]);

	async function toggleSaved(it: GenerationItem) {
		const next = !it.is_saved;
		setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, is_saved: next } : x)));
		if (selected?.id === it.id) setSelected({ ...it, is_saved: next });
		try {
			const res = await fetch("/api/generations", {
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ id: it.id, is_saved: next }),
			});
			const json: unknown = await res.json();
			const j = (json && typeof json === "object") ? (json as Record<string, unknown>) : {};
			if (!res.ok) throw new Error(typeof j.error === "string" ? j.error : "Failed to update");
			toast.success(next ? "Saved" : "Unsaved");
		} catch (e: unknown) {
			setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, is_saved: it.is_saved } : x)));
			if (selected?.id === it.id) setSelected(it);
			setError(e instanceof Error ? e.message : "Failed to update");
		}
	}

	async function regenerate(from: GenerationItem) {
		setRegenStatus("Generating variation...");
		setError(null);
		try {
			const res = await fetch("/api/generate", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					inputEmail: from.email_input,
					tone: (from.tone || "professional") as GenerationItem["tone"],
					length: (from.length || "medium") as GenerationItem["length"],
				}),
			});
			const json: unknown = await res.json();
			const j = (json && typeof json === "object") ? (json as Record<string, unknown>) : {};
			if (!res.ok) throw new Error(typeof j.error === "string" ? j.error : "Failed to generate");
			await load();
			setRegenStatus("Variation generated.");
			setTimeout(() => setRegenStatus(null), 1500);
		} catch (e: unknown) {
			setRegenStatus(null);
			setError(e instanceof Error ? e.message : "Failed to generate");
		}
	}

	async function onCopy(text: string) {
		await navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard");
	}

	return (
		<PageShell className="max-w-7xl">
			<PageHeader
				title="History"
				description="Search, save, revisit, and regenerate your previous replies from one place."
				actions={
					<HistoryToolbar
						query={query}
						onQueryChange={setQuery}
						savedOnly={savedOnly}
						onSavedOnlyChange={setSavedOnly}
						onRefresh={load}
						isRefreshing={isLoading}
					/>
				}
			/>

			{error ? (
				<div className="mt-6">
					<InlineMessage variant="error">{error}</InlineMessage>
				</div>
			) : null}
			{regenStatus ? (
				<div className="mt-3 text-sm text-muted-foreground">{regenStatus}</div>
			) : null}

			<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.08fr_0.92fr]">
				<Card className="bg-card/88">
					<CardHeader className="border-b border-border/70">
						<CardTitle>Items</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<LoadingState label="Loading history..." />
						) : filtered.length === 0 ? (
							query.trim() ? (
								<EmptyState
									title="No matches"
									description="Try a different search term, or clear the search."
									action={
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setQuery("");
												load();
											}}
										>
											Clear search
										</Button>
									}
								/>
							) : (
								<EmptyState
									title="No history yet"
									description="Generate a reply on the dashboard first, then it’ll show up here."
									action={
										<a className="underline" href="/dashboard">
											Go to dashboard
										</a>
									}
								/>
							)
						) : (
							<div className="grid gap-3">
								{filtered.map((it) => (
									<div key={it.id} className="grid gap-2">
										<GenerationListItem
											item={it}
											selected={selected?.id === it.id}
											onSelect={() => setSelected(it)}
											onToggleSaved={() => toggleSaved(it)}
										/>
										<div className="flex flex-wrap gap-2 pl-1">
											<Button variant="outline" size="sm" onClick={() => toggleSaved(it)}>
												{it.is_saved ? "Unsave" : "Save"}
											</Button>
											<Button
												variant="outline"
												size="sm"
												disabled={!it.ai_reply}
												onClick={() => it.ai_reply && onCopy(it.ai_reply)}
											>
												Copy reply
											</Button>
											<Button variant="outline" size="sm" onClick={() => regenerate(it)}>
												Regenerate
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="bg-card/88">
					<CardHeader className="flex flex-row items-center justify-between border-b border-border/70">
						<CardTitle>Details</CardTitle>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm" disabled={!selected} onClick={() => selected && toggleSaved(selected)}>
								{selected?.is_saved ? "Unsave" : "Save"}
							</Button>
							<Button variant="outline" size="sm" disabled={!selected?.ai_reply} onClick={() => selected?.ai_reply && onCopy(selected.ai_reply)}>
								Copy
							</Button>
							<Button variant="outline" size="sm" disabled={!selected} onClick={() => selected && regenerate(selected)}>
								Regenerate
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{selected ? (
							<Tabs defaultValue="reply" className="w-full">
								<TabsList>
									<TabsTrigger value="reply">Reply</TabsTrigger>
									<TabsTrigger value="email">Email</TabsTrigger>
								</TabsList>

								<TabsContent value="reply" className="mt-4">
									<div className="text-xs text-muted-foreground">Reply</div>
									<pre className="mt-2 max-h-[260px] overflow-auto whitespace-pre-wrap rounded-[calc(var(--radius)-4px)] border border-border/80 bg-background p-4 text-sm leading-7">
										{selected.ai_reply}
									</pre>
									<div className="mt-3 text-xs text-muted-foreground">Model: {selected.ai_model ?? "n/a"}</div>
								</TabsContent>

								<TabsContent value="email" className="mt-4">
									<div className="text-xs text-muted-foreground">Incoming email</div>
									<pre className="mt-2 max-h-[220px] overflow-auto whitespace-pre-wrap rounded-[calc(var(--radius)-4px)] border border-border/80 bg-background p-4 text-sm leading-7">
										{selected.email_input}
									</pre>
								</TabsContent>
							</Tabs>
						) : (
							<EmptyState
								title="Select an item"
								description="Pick a history item from the list to view details and copy or regenerate."
							/>
						)}
					</CardContent>
				</Card>
			</div>
		</PageShell>
	);
}
