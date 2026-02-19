import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    onClick?: () => void;
    variant?: "default" | "outline" | "danger";
}

export function ActionCard({ title, description, icon: Icon, onClick, variant = "default" }: ActionCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative flex flex-col items-start gap-4 rounded-xl border p-6 text-left shadow-sm transition-all duration-300 cursor-pointer bg-card",
                "hover:shadow-lg hover:border-primary/50 hover:-translate-y-1"
            )}
        >
            <div className={cn(
                "p-3 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-sm",
                variant === "danger"
                    ? "bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground"
                    : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-primary/30"
            )}>
                <Icon className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
                <h3 className="font-semibold leading-none tracking-tight text-lg group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}
