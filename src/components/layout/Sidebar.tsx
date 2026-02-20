"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Copy, GalleryVerticalEnd, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConsoleWidget } from "@/components/layout/ConsoleWidget";
import { ThemeToggle } from "./ThemeToggle";

const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard, color: "text-blue-500", bgHover: "hover:bg-blue-500/10" },
    { name: "Galería", href: "/gallery", icon: GalleryVerticalEnd, color: "text-purple-500", bgHover: "hover:bg-purple-500/10" },
    { name: "Configuración", href: "/settings", icon: Settings, color: "text-green-500", bgHover: "hover:bg-green-500/10" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r bg-card hidden md:flex flex-col h-screen fixed left-0 top-0 z-30 shadow-2xl shadow-primary/5">
            <div className="h-16 flex items-center px-6 border-b bg-gradient-to-r from-background to-accent/20">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mr-3 shadow-md shadow-indigo-500/20">
                    <Copy className="h-5 w-5 text-white" />
                </div>
                <span className="font-extrabold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-sm pb-1">
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
                                "flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-premium shadow-primary/25"
                                    : cn("text-muted-foreground hover:shadow-md hover:-translate-y-0.5", link.bgHover)
                            )}
                        >
                            <Icon className={cn(
                                "h-5 w-5 mr-3 transition-colors",
                                isActive ? "text-primary-foreground" : cn("text-muted-foreground group-hover:scale-110 duration-300", link.color)
                            )} />
                            <span className={cn(
                                "relative z-10 transition-colors",
                                isActive ? "text-primary-foreground font-semibold" : "group-hover:text-foreground"
                            )}>{link.name}</span>
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
