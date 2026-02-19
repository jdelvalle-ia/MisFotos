"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

export function useTheme() {
    const [theme, setTheme] = useState<Theme>("system");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        if (savedTheme) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTheme(savedTheme);
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setTheme("dark");
        }
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
            root.classList.add(systemTheme);
            return;
        }

        root.classList.add(theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return { theme, setTheme, toggleTheme };
}
