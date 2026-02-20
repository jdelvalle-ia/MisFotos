import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";
import React from "react"; // Added React import for React.ElementType

interface ActionCardProps {
    title: string;
    description: string;
    icon: React.ElementType; // Changed from LucideIcon
    onClick?: () => void;
    colorClass?: string; // New prop
    variant?: "default" | "outline" | "danger";
}

export function ActionCard({ title, description, icon: Icon, onClick, colorClass = "text-primary bg-primary/10 shadow-primary/20", variant = "default" }: ActionCardProps) {
    return (
        <Tooltip text={`Acceso rápido a: ${title}`} position="top">
            <div
                onClick={onClick}
                className={cn(
                    "group relative flex flex-col items-start gap-4 rounded-2xl border p-6 text-left shadow-md transition-all duration-300 cursor-pointer bg-card",
                    "hover:shadow-premium hover:border-primary/50 hover:-translate-y-1"
                )}
            >
                {/* Removed the old icon div with variant-based styling */}
                <div className={`p-4 rounded-2xl mb-4 transition-colors duration-300 w-fit ${colorClass}`}>
                    <Icon className="h-7 w-7" />
                </div>
                <div className="space-y-1.5">
                    <h3 className="font-semibold leading-none tracking-tight text-lg group-hover:text-primary transition-colors">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
        </Tooltip>
    );
}
