"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PageShell } from "@/components/app/PageShell";
import { PageHeader } from "@/components/app/PageHeader";
import { InlineMessage } from "@/components/app/InlineMessage";
import { EmptyState } from "@/components/app/EmptyState";
import { LoadingState } from "@/components/app/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

type Profile = {
	id: string;
	email: string;
	name: string | null;
	job_title: string | null;
	company: string | null;
	signature: string | null;
	default_tone: string | null;
};

export default function ProfileSettingsPage() {
	const router = useRouter();
	const [profile, setProfile] = useState<Profile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState("");
	const [error, setError] = useState<string | null>(null);

	const canSave = useMemo(() => !!profile && !isSaving, [profile, isSaving]);
	const canDelete = useMemo(() => deleteConfirm.trim().toLowerCase() === "delete" && !isDeleting, [deleteConfirm, isDeleting]);

	useEffect(() => {
		(async () => {
			setIsLoading(true);
			setError(null);
			try {
				const res = await fetch("/api/user");
				const json: unknown = await res.json();
				const j = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
				if (!res.ok) throw new Error(typeof j.error === "string" ? j.error : "Failed to load");
				setProfile(j.user as Profile);
			} catch (e: unknown) {
				setError(e instanceof Error ? e.message : "Failed to load");
			} finally {
				setIsLoading(false);
			}
		})();
	}, []);

	async function onSave() {
		if (!profile) return;
		setIsSaving(true);
		setError(null);
		try {
			const res = await fetch("/api/user", {
				method: "PUT",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					name: profile.name ?? "",
					job_title: profile.job_title ?? "",
					company: profile.company ?? "",
					signature: profile.signature ?? "",
					default_tone: profile.default_tone ?? "professional",
				}),
			});
			const json: unknown = await res.json();
			const j = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
			if (!res.ok) throw new Error(typeof j.error === "string" ? j.error : "Failed to save");
			setProfile(j.user as Profile);
			toast.success("Profile saved");
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Failed to save");
		} finally {
			setIsSaving(false);
		}
	}

	async function onDeleteAccount() {
		setError(null);
		setIsDeleting(true);
		try {
			const res = await fetch("/api/user", { method: "DELETE" });
			const json: unknown = await res.json().catch(() => null);
			const j = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
			if (!res.ok) throw new Error(typeof j.error === "string" ? j.error : "Failed to delete account");
			toast.success("Account deleted");
			setIsDeleteOpen(false);
			router.replace("/");
			router.refresh();
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Failed to delete account");
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<PageShell>
			<PageHeader title="Profile" description="Set the identity, tone, and signature used to shape new replies." />

			{error ? <div className="mt-6"><InlineMessage variant="error">{error}</InlineMessage></div> : null}

			<Card className="mt-6 bg-card/90">
				<CardContent className="grid gap-6 pt-6">
					{isLoading ? (
						<LoadingState label="Loading profile..." />
					) : profile ? (
						<>
							<section className="grid gap-4 rounded-[calc(var(--radius)+2px)] border border-border/70 bg-background/72 p-5">
								<div>
									<div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Account details</div>
									<p className="mt-2 text-sm leading-6 text-muted-foreground">Update the identity that informs your signature and reply context.</p>
								</div>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div className="grid gap-2">
										<Label>Email</Label>
										<Input value={profile.email} disabled />
									</div>
									<div className="grid gap-2">
										<Label>Name</Label>
										<Input value={profile.name ?? ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
									</div>
									<div className="grid gap-2">
										<Label>Job title</Label>
										<Input value={profile.job_title ?? ""} onChange={(e) => setProfile({ ...profile, job_title: e.target.value })} />
									</div>
									<div className="grid gap-2">
										<Label>Company</Label>
										<Input value={profile.company ?? ""} onChange={(e) => setProfile({ ...profile, company: e.target.value })} />
									</div>
								</div>
							</section>

							<section className="grid gap-4 rounded-[calc(var(--radius)+2px)] border border-border/70 bg-background/72 p-5">
								<div>
									<div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Preferences</div>
									<p className="mt-2 text-sm leading-6 text-muted-foreground">Choose the default tone used when you start a new reply.</p>
								</div>
								<div className="grid gap-2">
									<Label>Default tone</Label>
									<ToggleGroup
										type="single"
										value={profile.default_tone ?? "professional"}
										onValueChange={(v) => v && setProfile({ ...profile, default_tone: v })}
									>
										<ToggleGroupItem value="professional">Professional</ToggleGroupItem>
										<ToggleGroupItem value="friendly">Friendly</ToggleGroupItem>
										<ToggleGroupItem value="direct">Direct</ToggleGroupItem>
										<ToggleGroupItem value="empathetic">Empathetic</ToggleGroupItem>
									</ToggleGroup>
								</div>
							</section>

							<section className="grid gap-4 rounded-[calc(var(--radius)+2px)] border border-border/70 bg-background/72 p-5">
								<div>
									<div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Signature</div>
									<p className="mt-2 text-sm leading-6 text-muted-foreground">Optional sign-off appended to generated replies.</p>
								</div>
								<div className="grid gap-2">
									<Label>Signature</Label>
									<Textarea
										className="min-h-[160px]"
										value={profile.signature ?? ""}
										onChange={(e) => setProfile({ ...profile, signature: e.target.value })}
										placeholder={"Best,\nYour Name"}
									/>
								</div>
							</section>

							<div className="flex items-center justify-end">
								<Button disabled={!canSave} onClick={onSave}>
									{isSaving ? "Saving..." : "Save changes"}
								</Button>
							</div>
						</>
					) : (
						<EmptyState title="No profile found" description="Try refreshing the page or logging in again." />
					)}
				</CardContent>
			</Card>

			<Card className="mt-6 border-destructive/35 bg-destructive/5">
				<CardContent className="grid gap-4 pt-6">
					<div>
						<div className="text-xs font-semibold uppercase tracking-[0.16em] text-destructive">Danger zone</div>
						<div className="mt-2 text-lg font-semibold tracking-tight">Delete account</div>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							This permanently deletes your account and associated data, including history, usage counters, and subscriptions.
						</p>
					</div>
					<Dialog
						open={isDeleteOpen}
						onOpenChange={(open) => {
							setIsDeleteOpen(open);
							if (!open) setDeleteConfirm("");
						}}
					>
						<DialogTrigger asChild>
							<Button variant="destructive">Delete my account</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Delete account</DialogTitle>
								<DialogDescription>
									This action is permanent. All your data will be deleted and you will be signed out.
								</DialogDescription>
							</DialogHeader>
							<div className="mt-4 grid gap-2">
								<Label htmlFor="delete-confirm">Type <span className="font-medium">delete</span> to confirm</Label>
								<Input
									id="delete-confirm"
									value={deleteConfirm}
									onChange={(e) => setDeleteConfirm(e.target.value)}
									placeholder="delete"
									autoComplete="off"
								/>
							</div>
							<DialogFooter className="mt-6">
								<Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
									Cancel
								</Button>
								<Button variant="destructive" disabled={!canDelete} onClick={onDeleteAccount}>
									{isDeleting ? "Deleting..." : "Delete account"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</CardContent>
			</Card>
		</PageShell>
	);
}
