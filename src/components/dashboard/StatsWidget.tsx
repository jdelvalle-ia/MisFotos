import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";
import React from "react";

interface StatsWidgetProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    description?: string;
    className?: string;
    colorClass?: string;
}

export function StatsWidget({ title, value, icon: Icon, trend, description, className, colorClass = "text-primary bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground" }: StatsWidgetProps) {
    return (
        <Tooltip text={`Estadística: ${title.toLowerCase()}`} position="top">
            <div className={cn(
                "p-6 rounded-2xl border bg-card text-card-foreground shadow-md hover:shadow-premium transition-all duration-300 group hover:border-primary/50 hover:-translate-y-1 cursor-default",
                className
            )}>
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <h3 className="tracking-tight text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{title}</h3>
                    <div className={cn("p-2 rounded-xl group-hover:scale-110 transition-all duration-300 shadow-sm", colorClass)}>
                        <Icon className="h-4 w-4 transition-colors" />
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
        </Tooltip>
    );
}
