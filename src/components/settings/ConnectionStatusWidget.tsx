"use client";

import { useState } from "react";
import { Key, RotateCw, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";

export function ConnectionStatusWidget() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleTestConnection = async () => {
        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch("/api/test-connection");
            const data = await res.json();

            if (res.ok && data.success) {
                setStatus("success");
            } else {
                setStatus("error");
                setMessage(data.message || "Error desconocido");
            }
        } catch {
            setStatus("error");
            setMessage("Error de red al conectar con el servidor");
        }
    };

    return (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm relative group">
            <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                            <Key className={cn(
                                "h-5 w-5",
                                status === "error" ? "text-red-500" : "text-green-500"
                            )} />
                            Configuración de API
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Motor de obtención de datos y tokens para gemini.
                        </p>
                    </div>
                    {status === "success" && (
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    )}
                </div>

                <div className="pt-4">
                    {status === "idle" && (
                        <Tooltip text="Inicia una prueba de conexión rápida con el servidor" position="top" className="w-full">
                            <button
                                onClick={handleTestConnection}
                                className="w-full py-3 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 font-bold border border-green-500/20 hover:bg-green-500 hover:text-white dark:hover:text-white transition-all flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-premium"
                            >
                                <Wifi className="h-4 w-4" />
                                Probar conexión
                            </button>
                        </Tooltip>
                    )}

                    {status === "loading" && (
                        <div className="w-full py-3 flex items-center justify-center gap-2 text-sm text-muted-foreground animate-pulse">
                            <RotateCw className="h-4 w-4 animate-spin" />
                            Verificando...
                        </div>
                    )}

                    {status === "success" && (
                        <div className="flex items-center justify-between">
                            <div className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl text-sm font-bold border border-green-500/20 shadow-sm">
                                Conectado
                            </div>
                            <Tooltip text="Volver a intentar la conexión" position="top">
                                <button
                                    onClick={handleTestConnection}
                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                                >
                                    <RotateCw className="h-3 w-3" /> Re-test
                                </button>
                            </Tooltip>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold border border-red-500/20 shadow-sm">
                                    Error de conexión
                                </div>
                                <Tooltip text="Volver a intentar conectar con el servidor" position="top">
                                    <button
                                        onClick={handleTestConnection}
                                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                                    >
                                        <RotateCw className="h-3 w-3" /> Reintentar
                                    </button>
                                </Tooltip>
                            </div>
                            {message && (
                                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-100 dark:border-red-900/20">
                                    {message}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Decorative background gradient */}
            <div className={cn(
                "absolute -inset-1 opacity-10 blur-2xl transition-all duration-1000 -z-10",
                status === "error" ? "bg-gradient-to-tr from-red-500 via-transparent to-transparent" :
                    "bg-gradient-to-tr from-green-500 via-transparent to-transparent"
            )} />
        </div>
    );
}
