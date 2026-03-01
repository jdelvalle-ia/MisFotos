"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

type LogType = "info" | "success" | "warning" | "error";

export interface LogMessage {
    id: string;
    timestamp: Date;
    type: LogType;
    message: string;
}

interface ConsoleContextType {
    logs: LogMessage[];
    addLog: (message: string, type?: LogType) => void;
    clearLogs: () => void;
    isConsoleOpen: boolean;
    setConsoleOpen: (isOpen: boolean) => void;
}

const ConsoleContext = createContext<ConsoleContextType | undefined>(undefined);

export function ConsoleProvider({ children }: { children: React.ReactNode }) {
    const [logs, setLogs] = useState<LogMessage[]>([]);
    const [isConsoleOpen, setConsoleOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        // Load state from sessionStorage on mount
        const savedLogs = sessionStorage.getItem("app_console_logs");
        const savedState = sessionStorage.getItem("app_console_open");

        if (savedLogs) {
            try {
                const parsed = JSON.parse(savedLogs);
                if (Array.isArray(parsed)) {
                    // Re-hydrate dates
                    const hydrated = parsed.map(log => ({ ...log, timestamp: new Date(log.timestamp) }));
                    setLogs(hydrated);
                }
            } catch (e) {
                console.error("Failed to load saved logs", e);
            }
        }
        if (savedState) {
            setConsoleOpen(savedState === "true");
        }
    }, []);

    // Save to sessionStorage when state changes
    useEffect(() => {
        if (mounted) {
            sessionStorage.setItem("app_console_logs", JSON.stringify(logs));
        }
    }, [logs, mounted]);

    useEffect(() => {
        if (mounted) {
            sessionStorage.setItem("app_console_open", isConsoleOpen.toString());
        }
    }, [isConsoleOpen, mounted]);

    const addLog = useCallback((message: string, type: LogType = "info") => {
        const newLog: LogMessage = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            type,
            message
        };
        setLogs(prev => {
            const updated = [newLog, ...prev].slice(0, 100); // Keep last 100 logs
            if (mounted) sessionStorage.setItem("app_console_logs", JSON.stringify(updated));
            return updated;
        });
    }, [mounted]);

    const clearLogs = useCallback(() => {
        setLogs([]);
        if (mounted) sessionStorage.removeItem("app_console_logs");
    }, [mounted]);

    return (
        <ConsoleContext.Provider value={{ logs, addLog, clearLogs, isConsoleOpen, setConsoleOpen }}>
            {children}
        </ConsoleContext.Provider>
    );
}

export function useConsole() {
    const context = useContext(ConsoleContext);
    if (context === undefined) {
        throw new Error("useConsole must be used within a ConsoleProvider");
    }
    return context;
}
