"use client";

import { useConsole } from "@/context/ConsoleContext";
// import { ScrollArea } from "@/components/ui/scroll-area"; // Removed cause missing
import { Terminal, Trash2, X } from "lucide-react";
import { useState } from "react";

export function ConsoleWidget() {
    const { logs, clearLogs } = useConsole();
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsExpanded(true)}
                className="w-full flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                title="Abrir Consola"
            >
                <Terminal className="h-4 w-4 mr-3" />
                Consola sistema
            </button>

            {isExpanded && (
                <div className="fixed bottom-4 right-4 z-50 w-[600px] h-96 flex flex-col border rounded-lg bg-black text-green-400 font-mono text-xs overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between px-3 py-1 bg-gray-900 border-b border-gray-800">
                        <div className="flex items-center gap-2">
                            <Terminal className="h-3 w-3" />
                            <span className="font-semibold">System Logs</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={clearLogs} className="p-1 hover:bg-gray-800 rounded" title="Limpiar">
                                <Trash2 className="h-3 w-3" />
                            </button>
                            <button onClick={() => setIsExpanded(false)} className="p-1 hover:bg-gray-800 rounded" title="Minimizar">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                        {logs.length === 0 && (
                            <div className="text-gray-600 italic text-center mt-4">Esperando eventos...</div>
                        )}
                        {logs.map((log) => (
                            <div key={log.id} className="flex gap-2 break-all">
                                <span className="text-gray-500 whitespace-nowrap">
                                    [{log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                                </span>
                                <span className={
                                    log.type === 'error' ? 'text-red-400 font-bold' :
                                        log.type === 'warning' ? 'text-yellow-400' :
                                            log.type === 'success' ? 'text-green-300' :
                                                'text-gray-300'
                                }>
                                    {log.message}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
