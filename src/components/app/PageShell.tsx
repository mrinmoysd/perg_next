import { cn } from "@/lib/utils";

export function PageShell({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8", className)}>
			{children}
		</div>
	);
}
