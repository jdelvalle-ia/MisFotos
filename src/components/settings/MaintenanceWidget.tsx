"use client";

import { useState } from "react";
import { Copy, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PhotoMetadata } from "@/types";
import { useConsole } from "@/context/ConsoleContext";

interface MaintenanceWidgetProps {
    photos: Partial<PhotoMetadata>[];
    onGalleryUpdate: (newGallery: Partial<PhotoMetadata>[]) => void;
}

export function MaintenanceWidget({ photos, onGalleryUpdate }: MaintenanceWidgetProps) {
    const { addLog } = useConsole();
    const [duplicates, setDuplicates] = useState<Partial<PhotoMetadata>[][]>([]);
    const [scanning, setScanning] = useState(false);
    const [message, setMessage] = useState("");

    const detectDuplicates = () => {
        setScanning(true);
        setMessage("");
        addLog("Iniciando detección de duplicados...", "info");

        // Group by filename and size as potential duplicates
        const groups: Record<string, Partial<PhotoMetadata>[]> = {};

        photos.forEach(photo => {
            const key = `${photo.filename}_${photo.file_size_kb}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(photo);
        });

        const foundDuplicates = Object.values(groups).filter(group => group.length > 1);
        setDuplicates(foundDuplicates);
        setScanning(false);

        if (foundDuplicates.length > 0) {
            const totalDupes = foundDuplicates.reduce((acc, g) => acc + g.length - 1, 0);

            // Get filenames of the first 10 duplicate groups
            const firstTenNames = foundDuplicates.slice(0, 10).map(g => `"${g[0].filename}"`).join(", ");
            const hasMore = foundDuplicates.length > 10;
            const namesList = hasMore ? `${firstTenNames}... y más` : firstTenNames;

            setMessage(`Encontrados ${foundDuplicates.length} grupos de duplicados (${totalDupes} archivos redundantes). Archivos: ${namesList}`);
            addLog(`Encontrados ${foundDuplicates.length} grupos de duplicados: ${namesList}`, "warning");
        } else {
            setMessage("No se han encontrado duplicados.");
            addLog("No se encontraron duplicados.", "success");
        }
    };

    const removeDuplicates = () => {
        if (duplicates.length === 0) return;

        if (confirm(`¿Estás seguro de que deseas eliminar ${duplicates.reduce((acc, g) => acc + g.length - 1, 0)} duplicados de la lista?`)) {
            const toKeep = new Set<string>();
            const newGallery: Partial<PhotoMetadata>[] = [];

            // First, identify what to keep from the duplicates (just the first one of each group)
            const duplicatePaths = new Set(duplicates.flatMap(group => group.slice(1).map(p => p.path)));

            photos.forEach(photo => {
                if (!duplicatePaths.has(photo.path)) {
                    newGallery.push(photo);
                }
            });

            onGalleryUpdate(newGallery);
            localStorage.setItem("gallery_photos", JSON.stringify(newGallery));

            const removedCount = photos.length - newGallery.length;
            setDuplicates([]);
            setMessage(`Se han eliminado ${removedCount} duplicados correctamente.`);
            addLog(`Eliminados ${removedCount} duplicados de la galería.`, "success");
        }
    };

    return (
        <div className="bg-card rounded-2xl border p-6 shadow-sm hover:shadow-premium transition-all">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Copy className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Mantenimiento de Galería</h3>
                    <p className="text-sm text-muted-foreground">Limpia y optimiza tu colección</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col gap-2">
                    <button
                        onClick={detectDuplicates}
                        disabled={scanning || photos.length === 0}
                        className="w-full py-3 px-4 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm hover:shadow-md active:scale-[0.98]"
                    >
                        {scanning ? "Escaneando..." : "Detectar Duplicados"}
                    </button>

                    {duplicates.length > 0 && (
                        <button
                            onClick={removeDuplicates}
                            className="w-full py-3 px-4 bg-orange-600 text-white hover:bg-orange-700 rounded-xl transition-all font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
                        >
                            <Trash2 className="h-4 w-4" /> Eliminar Duplicados
                        </button>
                    )}
                </div>

                {message && (
                    <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${duplicates.length > 0 ? "bg-orange-50 text-orange-700 border border-orange-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
                        {duplicates.length > 0 ? <AlertTriangle className="h-4 w-4 mt-0.5" /> : <CheckCircle2 className="h-4 w-4 mt-0.5" />}
                        <p>{message}</p>
                    </div>
                )}

                {photos.length === 0 && (
                    <p className="text-xs text-center text-muted-foreground italic">
                        Carga una galería para habilitar las herramientas de mantenimiento.
                    </p>
                )}
            </div>
        </div>
    );
}
