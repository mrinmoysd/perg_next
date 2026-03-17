"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
	return (
		<SonnerToaster
			theme="system"
			toastOptions={{
				classNames: {
					toast: "bg-card text-card-foreground border shadow-sm",
					description: "text-muted-foreground",
					actionButton: "bg-primary text-primary-foreground",
					cancelButton: "bg-muted text-muted-foreground",
				},
			}}
		/>
	);
}
