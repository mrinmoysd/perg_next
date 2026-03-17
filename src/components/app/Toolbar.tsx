import { cn } from "@/lib/utils";

export function Toolbar({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
				className
			)}
		>
			{children}
		</div>
	);
}
