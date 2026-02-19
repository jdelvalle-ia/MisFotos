"use client";

import { useState, useEffect } from "react";
import { Terminal, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
    id: string;
    timestamp: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
}

export function AuditConsole() {
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Simulation of logs
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const types: LogEntry["type"][] = ["info", "success", "warning", "error"];
                const type = types[Math.floor(Math.random() * types.length)];
                const newLog: LogEntry = {
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: new Date().toLocaleTimeString(),
                    message: `Simulated system event: Process ${Math.floor(Math.random() * 1000)} ${type}`,
                    type
                };
                setLogs(prev => [newLog, ...prev].slice(0, 50));
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    return (
        <div className={cn(
            "fixed bottom-4 right-4 z-50 transition-all duration-300 shadow-xl border bg-card text-card-foreground rounded-lg overflow-hidden flex flex-col",
            isOpen ? "w-96 h-80" : "w-12 h-12 rounded-full cursor-pointer hover:scale-105"
        )}>
            <div
                className="flex items-center justify-between p-3 bg-muted cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    {isOpen && <span className="text-xs font-medium">System Audit Log</span>}
                </div>
                {isOpen && (
                    <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
                        <Minimize2 className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="flex-1 overflow-auto p-2 space-y-1 font-mono text-xs bg-black text-white">
                    {logs.length === 0 && <span className="text-gray-500">Waiting for events...</span>}
                    {logs.map(log => (
                        <div key={log.id} className="flex gap-2">
                            <span className="text-gray-500">[{log.timestamp}]</span>
                            <span className={cn(
                                log.type === "error" ? "text-red-400" :
                                    log.type === "warning" ? "text-yellow-400" :
                                        log.type === "success" ? "text-green-400" : "text-blue-400"
                            )}>
                                {log.message}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
