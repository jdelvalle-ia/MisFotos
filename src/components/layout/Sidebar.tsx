"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Copy, GalleryVerticalEnd, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConsoleWidget } from "@/components/layout/ConsoleWidget";
import { ThemeToggle } from "./ThemeToggle";

const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Galería", href: "/gallery", icon: GalleryVerticalEnd },
    { name: "Configuración", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r bg-card hidden md:flex flex-col h-screen fixed left-0 top-0 z-30 shadow-xl shadow-primary/5">
            <div className="h-16 flex items-center px-6 border-b bg-gradient-to-r from-background to-accent/20">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                    <Copy className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold text-lg text-primary tracking-tight">
                    MisFotos
                </span>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-md"
                            )}
                        >
                            <Icon className={cn(
                                "h-5 w-5 mr-3 transition-colors",
                                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                            )} />
                            <span className="relative z-10">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 space-y-4 border-t bg-muted/30">
                <ConsoleWidget />
                <div className="pt-2">
                    <ThemeToggle showLabel />
                </div>
            </div>

            <div className="p-4 border-t text-xs text-muted-foreground text-center bg-muted/50">
                v1.0.1
            </div>
        </aside>
    );
}
