"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
    className?: string;
    showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel }: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button
                className={cn(
                    "flex items-center gap-3 px-4 py-2 w-full text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                    className
                )}
                aria-label="Toggle Theme"
            >
                <Moon className="h-4 w-4" />
                {showLabel && <span>Modo oscuro</span>}
            </button>
        );
    }

    const isDark = theme === "dark";

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "flex items-center gap-3 px-4 py-2 w-full text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                className
            )}
            aria-label="Toggle Theme"
        >
            {isDark ? (
                <>
                    <Sun className="h-4 w-4" />
                    {showLabel && <span>Modo claro</span>}
                </>
            ) : (
                <>
                    <Moon className="h-4 w-4" />
                    {showLabel && <span>Modo oscuro</span>}
                </>
            )}
        </button>
    );
}
