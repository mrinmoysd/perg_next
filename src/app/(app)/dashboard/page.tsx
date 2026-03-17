"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/app/PageShell";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ReplyEditor } from "@/components/generation/ReplyEditor";
import { VariationsBar, type VariationItem } from "@/components/generation/VariationsBar";
import { capture } from "@/lib/analytics/posthog";

type Tone = "professional" | "friendly" | "direct" | "empathetic";
type ReplyLength = "short" | "medium" | "long";

export default function DashboardPage() {
	const [inputEmail, setInputEmail] = useState("");
	const [tone, setTone] = useState<Tone>("professional");
	const [length, setLength] = useState<ReplyLength>("medium");
	const [reply, setReply] = useState("");
	const [lastGenerationId, setLastGenerationId] = useState<string | null>(null);
	const [lastIsSaved, setLastIsSaved] = useState<boolean>(false);
	const [variations, setVariations] = useState<VariationItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [quotaText, setQuotaText] = useState<string | null>(null);

	const canGenerate = useMemo(() => inputEmail.trim().length > 0 && !isLoading, [
		inputEmail,
		isLoading,
	]);

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch("/api/user");
				if (!res.ok) return;
				const json: unknown = await res.json();
				const j = (json && typeof json === "object") ? (json as Record<string, unknown>) : {};
				const user = (j.user && typeof j.user === "object") ? (j.user as Record<string, unknown>) : undefined;
				const defaultTone = user && typeof user.default_tone === "string" ? user.default_tone : undefined;
				if (
					defaultTone === "professional" ||
					defaultTone === "friendly" ||
					defaultTone === "direct" ||
					defaultTone === "empathetic"
				) {
					setTone(defaultTone);
				}
			} catch {
				// ignore
			}
		})();
	}, []);

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch("/api/billing/status");
				if (!res.ok) return;
				const json: unknown = await res.json();
				const j = (json && typeof json === "object") ? (json as Record<string, unknown>) : {};
				const quota = (j.quota && typeof j.quota === "object") ? (j.quota as Record<string, unknown>) : undefined;
				const remaining = typeof quota?.remaining === "number" ? quota.remaining : null;
				const limit = typeof quota?.limit === "number" ? quota.limit : null;
				if (remaining !== null && limit !== null) setQuotaText(`${remaining}/${limit} left today`);
			} catch {
				// ignore
			}
		})();
	}, []);

	async function onGenerate() {
		capture("generate.clicked", { tone, length });
		setIsLoading(true);
		setError(null);
		setReply("");
		setLastGenerationId(null);
		setLastIsSaved(false);
		try {
			const res = await fetch("/api/generate", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ inputEmail, tone, length }),
			});
			const json: unknown = await res.json();
			const j = (json && typeof json === "object") ? (json as Record<string, unknown>) : {};
			if (!res.ok) {
				const err = typeof j.error === "string" ? j.error : "Failed to generate";
				if (res.status === 429 || err === "QUOTA_EXCEEDED") {
					capture("generate.quota_exceeded");
					setError("You’ve used today’s free replies. Upgrade to continue.");
					return;
				}
				capture("generate.failed");
				throw new Error(err);
			}

			setReply(typeof j.reply === "string" ? j.reply : "");
			capture("generate.succeeded", { tone, length });
			const newId = typeof j.generationId === "string" ? j.generationId : null;
			setLastGenerationId(newId);
			setLastIsSaved(false);
			setVariations(newId ? [{ id: newId, created_at: new Date().toISOString(), is_saved: false }] : []);
			const quota = (j.quota && typeof j.quota === "object") ? (j.quota as Record<string, unknown>) : undefined;
			const remaining = typeof quota?.remaining === "number" ? quota.remaining : null;
			const limit = typeof quota?.limit === "number" ? quota.limit : null;
			if (remaining !== null && limit !== null) setQuotaText(`${remaining}/${limit} left today`);
		} catch (e: unknown) {
			capture("generate.failed");
			setError(e instanceof Error ? e.message : "Something went wrong");
		} finally {
			setIsLoading(false);
		}
	}

	async function onCopy() {
		if (!reply) return;
		await navigator.clipboard.writeText(reply);
		toast.success("Copied to clipboard");
		capture("reply.copy_clicked");
	}

	async function onToggleSaved() {
		if (!lastGenerationId) {
			toast.error("This reply was not saved. Generate again and try once it completes.");
			return;
		}
		const next = !lastIsSaved;
		setLastIsSaved(next);
		try {
			capture("reply.save_toggled", { next });
			const res = await fetch(`/api/generations/${lastGenerationId}/save`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ is_saved: next }),
			});
			const json: unknown = await res.json();
			const j = (json && typeof json === "object") ? (json as Record<string, unknown>) : {};
			if (!res.ok) throw new Error(typeof j.error === "string" ? j.error : "Failed to update");
			setVariations((v) => v.map((it) => (it.id === lastGenerationId ? { ...it, is_saved: next } : it)));
			toast.success(next ? "Saved" : "Unsaved");
		} catch (e: unknown) {
			setLastIsSaved(!next);
			toast.error(e instanceof Error ? e.message : "Failed to update");
		}
	}

	async function onRegenerate() {
		if (!lastGenerationId) {
			toast.error("This reply was not saved. Generate again and try once it completes.");
			return;
		}
		capture("regenerate.clicked", { tone, length });
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/regenerate", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ parentId: lastGenerationId, inputEmail, tone, length }),
			});
			const json: unknown = await res.json();
			const j = (json && typeof json === "object") ? (json as Record<string, unknown>) : {};
			if (!res.ok) {
				const err = typeof j.error === "string" ? j.error : "Failed to regenerate";
				if (res.status === 429 || err === "QUOTA_EXCEEDED") {
					capture("regenerate.quota_exceeded");
					setError("You’ve used today’s free replies. Upgrade to continue.");
					return;
				}
				capture("regenerate.failed");
				throw new Error(err);
			}

			setReply(typeof j.reply === "string" ? j.reply : "");
			capture("regenerate.succeeded");
			const newId = typeof j.generationId === "string" ? j.generationId : null;
			if (newId) {
				setLastGenerationId(newId);
				setLastIsSaved(false);
				setVariations((prev) => [{ id: newId, created_at: new Date().toISOString(), is_saved: false }, ...prev]);
			}
			const quota = (j.quota && typeof j.quota === "object") ? (j.quota as Record<string, unknown>) : undefined;
			const remaining = typeof quota?.remaining === "number" ? quota.remaining : null;
			const limit = typeof quota?.limit === "number" ? quota.limit : null;
			if (remaining !== null && limit !== null) setQuotaText(`${remaining}/${limit} left today`);
		} catch (e: unknown) {
			capture("regenerate.failed");
			setError(e instanceof Error ? e.message : "Something went wrong");
		} finally {
			setIsLoading(false);
		}
	}

	async function onSelectVariation(id: string) {
		setError(null);
		try {
			const res = await fetch(`/api/generations/${id}`);
			const json: unknown = await res.json();
			const j = (json && typeof json === "object") ? (json as Record<string, unknown>) : {};
			if (!res.ok) throw new Error(typeof j.error === "string" ? j.error : "Failed to load");
			const item = (j.item && typeof j.item === "object") ? (j.item as Record<string, unknown>) : undefined;
			setReply(typeof item?.ai_reply === "string" ? String(item.ai_reply) : "");
			setLastGenerationId(id);
			setLastIsSaved(Boolean(item?.is_saved));
		} catch (e: unknown) {
			toast.error(e instanceof Error ? e.message : "Failed to load");
		}
	}

	return (
		<PageShell>
			<PageHeader
				title="Generate an email reply"
				description="Paste an incoming email, choose the voice you want, and turn it into a polished reply you can copy, save, or regenerate."
				actions={
					quotaText ? (
						<Badge variant="outline" className="bg-background/80 text-[11px] tracking-[0.14em]">
							Quota: {quotaText}
						</Badge>
					) : null
				}
			/>

			<div className="mt-8 grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
				<Card className="bg-card/88">
					<CardHeader className="border-b border-border/70">
						<div className="flex items-start justify-between gap-3">
							<div>
								<CardTitle>Incoming email</CardTitle>
								<p className="mt-2 text-sm text-muted-foreground">Start with the message you received, then steer the response with tone and length.</p>
							</div>
							<Badge variant="outline">Compose</Badge>
						</div>
					</CardHeader>
					<CardContent className="grid gap-4">
						<div className="grid gap-2 rounded-[calc(var(--radius)-2px)] border border-border/70 bg-background/72 p-4">
							<Label>Paste the email</Label>
							<Textarea
								className="min-h-[240px] rounded-[calc(var(--radius)-6px)] border-border/80 bg-background"
								placeholder="Paste the email you received..."
								value={inputEmail}
								onChange={(e) => setInputEmail(e.target.value)}
							/>
							<p className="text-xs text-muted-foreground">
								Your email text is used only to generate your reply.
							</p>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="grid gap-2 rounded-[calc(var(--radius)-2px)] border border-border/70 bg-background/72 p-4">
								<Label>Tone</Label>
								<ToggleGroup
									type="single"
									value={tone}
									onValueChange={(v) => v && setTone(v as Tone)}
									variant="outline"
									size="sm"
								>
									<ToggleGroupItem value="professional">Professional</ToggleGroupItem>
									<ToggleGroupItem value="friendly">Friendly</ToggleGroupItem>
									<ToggleGroupItem value="direct">Direct</ToggleGroupItem>
									<ToggleGroupItem value="empathetic">Empathetic</ToggleGroupItem>
								</ToggleGroup>
							</div>
							<div className="grid gap-2 rounded-[calc(var(--radius)-2px)] border border-border/70 bg-background/72 p-4">
								<Label>Length</Label>
								<ToggleGroup
									type="single"
									value={length}
									onValueChange={(v) => v && setLength(v as ReplyLength)}
									variant="outline"
									size="sm"
								>
									<ToggleGroupItem value="short">Short</ToggleGroupItem>
									<ToggleGroupItem value="medium">Medium</ToggleGroupItem>
									<ToggleGroupItem value="long">Long</ToggleGroupItem>
								</ToggleGroup>
							</div>
						</div>

						<Button disabled={!canGenerate} onClick={onGenerate} className="w-full sm:w-auto">
							{isLoading ? "Generating..." : "Generate reply"}
						</Button>

						{error ? (
							<Alert variant="destructive">
								<AlertTitle>Couldn’t generate</AlertTitle>
								<AlertDescription>
									<div className="flex flex-wrap items-center justify-between gap-3">
										<span>{error}</span>
										<a
											className="underline"
											href="/settings/billing"
											onClick={() => capture("upgrade_clicked", { source: "dashboard_quota_alert" })}
										>
											Upgrade
										</a>
									</div>
								</AlertDescription>
							</Alert>
						) : null}
					</CardContent>
				</Card>

				<Card className="border-primary/15 bg-gradient-to-b from-card via-card to-accent/20">
					<CardHeader className="border-b border-border/70">
						<div className="flex items-start justify-between gap-3">
							<div>
								<CardTitle>Reply</CardTitle>
								<p className="mt-2 text-sm text-muted-foreground">Edit the draft, copy it, or save the version you want to keep.</p>
							</div>
							<Badge>Output</Badge>
						</div>
					</CardHeader>
					<CardContent>
						{reply ? (
							<div className="grid gap-6">
								<ReplyEditor
									value={reply}
									onChange={setReply}
									onCopy={onCopy}
									onToggleSaved={onToggleSaved}
									onRegenerate={onRegenerate}
									canCopy={!!reply}
									canSave={!!reply && !!lastGenerationId}
									canRegenerate={!!inputEmail.trim() && !!lastGenerationId}
									isSaved={lastIsSaved}
									isBusy={isLoading}
								/>

								<VariationsBar items={variations} activeId={lastGenerationId} onSelect={onSelectVariation} />
							</div>
						) : (
							<EmptyState
								title="No reply yet"
								description="Generate a reply to see it here."
								className="rounded-[calc(var(--radius)+2px)] border border-dashed border-border/80 bg-background/60 p-8"
							/>
						)}
					</CardContent>
				</Card>
			</div>
		</PageShell>
	);
}
