"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

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
}

const ConsoleContext = createContext<ConsoleContextType | undefined>(undefined);

export function ConsoleProvider({ children }: { children: React.ReactNode }) {
    const [logs, setLogs] = useState<LogMessage[]>([]);

    const addLog = useCallback((message: string, type: LogType = "info") => {
        const newLog: LogMessage = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            type,
            message
        };
        setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
    }, []);

    const clearLogs = useCallback(() => {
        setLogs([]);
    }, []);

    // Also hook into window.console for global capture (optional, but useful)
    // useEffect(() => {
    //     const originalLog = console.log;
    //     console.log = (...args) => {
    //         originalLog(...args);
    //         // Convert args to string carefully
    //         const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    //         addLog(msg, 'info');
    //     };
    //     return () => { console.log = originalLog; };
    // }, [addLog]);

    return (
        <ConsoleContext.Provider value={{ logs, addLog, clearLogs }}>
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
