"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { scanDirectory, analyzeFile, saveCsv, saveScannedDirectory } from "@/app/actions";
import { ScanResult, PhotoMetadata } from "@/types";
import { parseAIResponse } from "@/lib/string-utils";

interface ScanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanComplete: (result: ScanResult) => void;
}

export function ScanModal({ isOpen, onClose, onScanComplete }: ScanModalProps) {
    const [path, setPath] = useState("");
    const [scanning, setScanning] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleScan = async () => {
        if (!path) return;
        setScanning(true);
        setError("");
        setScanResult(null);

        try {
            const result = await scanDirectory(path);
            if (result.error) {
                setError(result.error);
            } else {
                setScanResult(result);
            }
        } catch {
            setError("Error inesperado al escanear.");
        } finally {
            setScanning(false);
        }
    };

    const handleSaveOnly = async () => {
        if (!scanResult?.images || scanResult.images.length === 0) return;
        setScanning(true); // Reuse scanning state for loading UI

        try {
            const csvPath = `${path}\\photos.csv`;
            await saveCsv(csvPath, scanResult.images);
            await saveScannedDirectory(path);

            onScanComplete({
                success: true,
                count: scanResult.images.length,
                images: scanResult.images
            });
            onClose();
        } catch (err) {
            setError("Error al guardar.");
            console.error(err);
        } finally {
            setScanning(false);
        }
    };

    const handleAnalyze = async () => {
        if (!scanResult?.images || scanResult.images.length === 0) return;

        setAnalyzing(true);
        setProgress({ current: 0, total: scanResult.images.length });

        const processedImages: Partial<PhotoMetadata>[] = [];

        // Process sequentially to avoid rate limits
        for (let i = 0; i < scanResult.images.length; i++) {
            const img = scanResult.images[i];
            if (!img || !img.path) continue;

            try {
                const analysis = await analyzeFile(img.path);

                let aiMetadata = {};
                if (analysis.success && analysis.data) {
                    aiMetadata = parseAIResponse(analysis.data);
                }

                processedImages.push({
                    ...img,
                    ...aiMetadata,
                });

            } catch (err) {
                console.error(`Failed to analyze ${img.filename}`, err);
                processedImages.push(img); // Keep original if fail
            }

            setProgress(prev => ({ ...prev, current: i + 1 }));
        }

        const csvPath = `${path}\\photos.csv`;
        await saveCsv(csvPath, processedImages);

        onScanComplete({
            success: true,
            count: processedImages.length,
            images: processedImages
        });

        // Save directory to persistent config
        await saveScannedDirectory(path);

        setAnalyzing(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md rounded-lg shadow-lg border p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Escanear Directorio</h3>
                    <button onClick={onClose}><X className="h-4 w-4" /></button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Ruta Local</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={path}
                            onChange={(e) => setPath(e.target.value)}
                            placeholder="C:\Fotos\Verano2024"
                            className="flex-1 p-2 rounded-md border bg-background text-sm"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Ingresa la ruta absoluta de la carpeta que deseas escanear.
                    </p>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded-md hover:bg-accent"
                        disabled={scanning || analyzing}
                    >
                        Cancelar
                    </button>
                    {scanResult && !analyzing && (
                        <>
                            <button
                                onClick={handleAnalyze}
                                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                            >
                                Analizar {scanResult.count} Fotos con IA
                            </button>
                            <button
                                onClick={handleSaveOnly}
                                className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center gap-2"
                            >
                                Guardar (Sin IA)
                            </button>
                        </>
                    )}
                    {!scanResult && (
                        <button
                            onClick={handleScan}
                            disabled={scanning || !path}
                            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
                        >
                            {scanning && <Loader2 className="h-3 w-3 animate-spin" />}
                            {scanning ? "Escaneando..." : "Iniciar Escaneo"}
                        </button>
                    )}
                </div>

            </div>

            {analyzing && (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Analizando imágenes...</span>
                        <span>{progress.current} / {progress.total}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
