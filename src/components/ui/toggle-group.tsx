"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleGroupItemVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 text-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-muted text-muted-foreground hover:text-foreground",
					outline: "border border-input bg-background hover:bg-accent hover:text-foreground",
			},
			size: {
				default: "h-9 px-3",
				sm: "h-8 px-2",
				lg: "h-10 px-4",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

type ToggleGroupContextValue = {
	variant?: VariantProps<typeof toggleGroupItemVariants>["variant"];
	size?: VariantProps<typeof toggleGroupItemVariants>["size"];
};

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({});

function ToggleGroup({
	className,
	variant,
	size,
	...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
	VariantProps<typeof toggleGroupItemVariants>) {
	return (
		<ToggleGroupContext.Provider value={{ variant: variant ?? undefined, size: size ?? undefined }}>
			<ToggleGroupPrimitive.Root
				data-slot="toggle-group"
				className={cn(
					// use full width and allow items to wrap within the column so
					// Tone / Length groups never overflow into neighbouring column
					"w-full flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-1.5",
					className
				)}
				{...props}
			/>
		</ToggleGroupContext.Provider>
	);
}

function ToggleGroupItem({
	className,
	...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
	const ctx = React.useContext(ToggleGroupContext);
	return (
		<ToggleGroupPrimitive.Item
			data-slot="toggle-group-item"
			className={cn(
				toggleGroupItemVariants({ variant: ctx.variant, size: ctx.size }),
				"hover:shadow-sm",
				// Visible active state: primary background + foreground text + subtle shadow + border
				"data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm data-[state=on]:border data-[state=on]:border-primary/50",
				className
			)}
			{...props}
		/>
	);
}

export { ToggleGroup, ToggleGroupItem };
