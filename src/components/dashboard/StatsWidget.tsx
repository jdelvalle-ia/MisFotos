import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsWidgetProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    description?: string;
    className?: string;
}

export function StatsWidget({ title, value, icon: Icon, trend, description, className }: StatsWidgetProps) {
    return (
        <div className={cn(
            "p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 group hover:border-primary/50 hover:-translate-y-1",
            className
        )}>
            <div className="flex items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{title}</h3>
                <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <Icon className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
            </div>
            <div className="flex flex-col pt-3">
                <div className="flex items-center">
                    <div className="text-3xl font-bold text-foreground">{value}</div>
                    {trend && <span className="text-xs text-muted-foreground ml-2">{trend}</span>}
                </div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1 font-medium">{description}</p>
                )}
            </div>
        </div>
    );
}
