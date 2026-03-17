"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
	theme: Theme;
	setTheme: (t: Theme) => void;
	toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(() => {
		if (typeof window === "undefined") return "light";
		try {
			const stored = window.localStorage.getItem("perg_theme");
			if (stored === "dark" || stored === "light") return stored;
			if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
		} catch {
			// ignore
		}
		return "light";
	});

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		try {
			window.localStorage.setItem("perg_theme", theme);
		} catch {
			// ignore
		}
	}, [theme]);

	const value = useMemo<ThemeContextValue>(
		() => ({
			theme,
			setTheme: (t) => setThemeState(t),
			toggleTheme: () => setThemeState((prev) => (prev === "dark" ? "light" : "dark")),
		}),
		[theme]
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
}
