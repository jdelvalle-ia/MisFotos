"use client";

import { useState, useRef } from "react";
import { Upload, FolderPlus, Download, X, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { PhotoMetadata } from "@/types";
import { parseCSV, generateCSV } from "@/lib/client-csv-utils";
import { analyzeImageClient } from "@/lib/client-ai-service";
import { compressImage } from "@/lib/utils";

interface GalleryManagerProps {
    isOpen: boolean;
    mode: "select" | "update" | "download";
    onClose: () => void;
    currentGallery: Partial<PhotoMetadata>[];
    onGalleryUpdate: (newGallery: Partial<PhotoMetadata>[]) => void;
}

import { useConsole } from "@/context/ConsoleContext";

export function GalleryManager({ isOpen, mode, onClose, currentGallery, onGalleryUpdate }: GalleryManagerProps) {
    const { addLog } = useConsole();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [error, setError] = useState("");
    const [basePath, setBasePath] = useState("");

    // Hidden inputs
    const csvInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const getResolutionLabel = (width: number, height: number): string => {
        const pixels = width * height;
        if (pixels >= 3840 * 2160) return "4K";
        if (pixels >= 2560 * 1440) return "2K";
        if (pixels >= 1920 * 1080) return "FHD";
        if (pixels >= 1280 * 720) return "HD";
        return "SD";
    };

    const getAspectRatio = (width: number, height: number): string => {
        if (height === 0) return "Unknown";
        const ratio = width / height;
        if (Math.abs(ratio - 1) < 0.05) return "1:1";
        if (Math.abs(ratio - 4 / 3) < 0.05) return "4:3";
        if (Math.abs(ratio - 16 / 9) < 0.05) return "16:9";
        if (Math.abs(ratio - 3 / 2) < 0.05) return "3:2";
        if (Math.abs(ratio - 2 / 3) < 0.05) return "2:3";
        if (Math.abs(ratio - 9 / 16) < 0.05) return "9:16";
        return "Other";
    };

    const getImageDimensions = (file: File): Promise<{ width: number, height: number }> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
                URL.revokeObjectURL(img.src);
            };
            img.onerror = () => resolve({ width: 0, height: 0 });
            img.src = URL.createObjectURL(file);
        });
    };

    const handleNewGallery = () => {
        if (confirm("¿Estás seguro de querer iniciar una nueva galería vacía? Se borrarán las fotos actuales de la vista (no del disco).")) {
            onGalleryUpdate([]);
            onClose();
            addLog("Iniciada nueva galería vacía", "info");
        }
    };

    const handleSelectGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError("");
        addLog(`Cargando galería desde: ${file.name}`, "info");

        try {
            const text = await file.text();
            const data = await parseCSV(text);

            if (data.length === 0) {
                const msg = "El archivo CSV no contiene fotos válidas o está vacío.";
                setError(msg);
                addLog(msg, "warning");
            } else {
                addLog(`Galería cargada con ${data.length} fotos.`, "success");
                onGalleryUpdate(data);
                onClose();
            }
        } catch (err) {
            console.error(err);
            const msg = "Error al leer el archivo CSV.";
            setError(msg);
            addLog(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setLoading(true);
        setProgress({ current: 0, total: files.length });
        addLog(`Iniciando actualización con ${files.length} archivos detectados.`, "info");

        const newPhotos: Partial<PhotoMetadata>[] = [];

        const imageFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
        addLog(`Filtrado: ${imageFiles.length} imágenes válidas encontradas.`, "info");
        setProgress({ current: 0, total: imageFiles.length });

        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];

            try {
                const objectUrl = URL.createObjectURL(file);
                const { width, height } = await getImageDimensions(file);

                addLog(`Analizando [${i + 1}/${imageFiles.length}]: ${file.name}...`, "info");

                // Compress image before upload to avoid payload limits
                let fileToAnalyze = file;
                try {
                    fileToAnalyze = await compressImage(file);
                    // Log compression results if significant
                    if (fileToAnalyze.size < file.size) {
                        const savings = Math.round((1 - fileToAnalyze.size / file.size) * 100);
                        console.log(`Compressed ${file.name}: ${Math.round(file.size / 1024)}KB -> ${Math.round(fileToAnalyze.size / 1024)}KB (-${savings}%)`);
                    }
                } catch (compErr) {
                    console.warn("Compression failed, trying original:", compErr);
                }

                const aiData = await analyzeImageClient(fileToAnalyze);

                // Detailed logging for AI Debugging
                addLog(`IA Completada para ${file.name}. Etiquetas: ${aiData.tags?.length || 0}`, "success");
                if (!aiData.description) addLog(`ADVERTENCIA: Sin descripción para ${file.name}`, "warning");

                // Construct full path if base path is provided
                const relativePath = file.webkitRelativePath || file.name;
                let fullPath = relativePath;

                if (basePath) {
                    const normalizedBase = basePath.replace(/\\/g, '/').replace(/\/$/, '');
                    const firstPart = relativePath.split('/')[0];

                    // Specific check: if base path ends with the first folder of relative path, avoid duplication
                    if (normalizedBase.endsWith(`/${firstPart}`)) {
                        // Base: .../MisFotos, Relative: MisFotos/IMG... -> .../MisFotos/IMG...
                        const remainder = relativePath.substring(firstPart.length);
                        fullPath = `${normalizedBase}${remainder}`;
                    } else {
                        fullPath = `${normalizedBase}/${relativePath}`;
                    }
                }

                newPhotos.push({
                    description: "", // Default
                    tags: [], // Default
                    ...aiData, // AI data overrides defaults if present
                    date_added: new Date().toISOString(),
                    date_taken: aiData.date_taken || new Date(file.lastModified).toISOString(),
                    filename: file.name,
                    path: objectUrl, // Blob for display
                    // @ts-ignore - Storing for export
                    realPath: fullPath,
                    format: file.type.split('/')[1],
                    file_size_kb: Math.round(file.size / 1024),
                    width,
                    height,
                    resolution: getResolutionLabel(width, height),
                    aspect_ratio: getAspectRatio(width, height),
                    orientation: width > height ? 'horizontal' : width < height ? 'vertical' : 'square',
                });

            } catch (err: any) {
                const errMsg = `Error analizando ${file.name}: ${err.message || "Error desconocido"}`;
                console.error(errMsg, err);
                addLog(errMsg, "error");

                const objectUrl = URL.createObjectURL(file);

                // Same path logic for error case
                const relativePath = file.webkitRelativePath || file.name;
                let fullPath = relativePath;

                if (basePath) {
                    const normalizedBase = basePath.replace(/\\/g, '/').replace(/\/$/, '');
                    const firstPart = relativePath.split('/')[0];

                    if (normalizedBase.endsWith(`/${firstPart}`)) {
                        const remainder = relativePath.substring(firstPart.length);
                        fullPath = `${normalizedBase}${remainder}`;
                    } else {
                        fullPath = `${normalizedBase}/${relativePath}`;
                    }
                }

                // Get basic dimensions even on error if possible
                let width = 0, height = 0;
                try {
                    const dims = await getImageDimensions(file);
                    width = dims.width;
                    height = dims.height;
                } catch (e) { }

                newPhotos.push({
                    filename: file.name,
                    path: objectUrl,
                    // @ts-ignore
                    realPath: fullPath,
                    file_size_kb: Math.round(file.size / 1024),
                    format: file.type.split('/')[1],
                    width,
                    height
                });
            }

            setProgress(prev => ({ ...prev, current: i + 1 }));
        }

        onGalleryUpdate([...currentGallery, ...newPhotos]);
        onClose();
        setLoading(false);
    };

    const handleDownloadGallery = () => {
        if (currentGallery.length === 0) {
            setError("No hay datos para exportar.");
            return;
        }

        try {
            const cleanGallery = currentGallery.map((p: any) => {
                const { realPath, ...rest } = p;
                return {
                    ...rest,
                    // Use realPath if available, otherwise fallback to path if not blob, else filename
                    path: realPath || (p.path?.startsWith('blob:') ? p.filename : p.path)
                };
            });

            const csv = generateCSV(cleanGallery);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const date = new Date();
            const dateStr = date.toISOString().split('T')[0].replace(/-/g, '_'); // YYYY_MM_DD
            const a = document.createElement('a');
            a.href = url;
            a.download = `mis-fotos-galeria_${dateStr}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            onClose();
        } catch (err) {
            setError("Error al generar el CSV.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md rounded-lg shadow-lg border p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                        {mode === "select" && "Seleccionar Galería (CSV)"}
                        {mode === "update" && "Actualizar Galería"}
                        {mode === "download" && "Descargar Galería"}
                    </h3>
                    <button onClick={onClose}><X className="h-4 w-4" /></button>
                </div>

                <div className="space-y-4">
                    {mode === "select" && (
                        <div className="space-y-4">
                            <div className="p-4 border-2 border-dashed rounded-xl hover:bg-accent/50 transition-colors cursor-pointer text-center"
                                onClick={() => csvInputRef.current?.click()}>
                                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                                <h3 className="font-medium text-lg mb-1">Cargar CSV de Galería</h3>
                                <p className="text-sm text-muted-foreground">
                                    Selecciona un archivo .csv exportado anteriormente
                                </p>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">O</span>
                                </div>
                            </div>

                            <button
                                onClick={handleNewGallery}
                                className="w-full py-4 border rounded-xl hover:bg-accent/50 transition-colors flex flex-col items-center justify-center gap-2 group"
                            >
                                <FolderPlus className="h-6 w-6 text-muted-foreground group-hover:text-foreground" />
                                <span className="font-medium">Iniciar Nueva Galería Vacía</span>
                            </button>

                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                ref={csvInputRef}
                                onChange={handleSelectGallery}
                            />
                        </div>
                    )}

                    {mode === "update" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ruta Base (Requerido para CSV)</label>
                                <input
                                    type="text"
                                    placeholder="Ej: C:\Users\julia\Downloads\MisFotos"
                                    className="w-full p-2 border rounded-md text-sm"
                                    value={basePath}
                                    onChange={(e) => setBasePath(e.target.value)}
                                />
                                <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                                    <strong>Nota de Seguridad:</strong> Los navegadores web no permiten leer la ruta completa de tu disco duro automáticamente.
                                    Por favor, copia y pega la ruta de la carpeta aquí para que el archivo CSV pueda guardar la ubicación correcta de tus fotos.
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-6 border-2 border-dashed rounded-lg hover:bg-accent/50 cursor-pointer flex flex-col items-center justify-center gap-2"
                                    onClick={() => folderInputRef.current?.click()}>
                                    <FolderPlus className="h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm font-medium">Seleccionar Carpeta</p>
                                    <input
                                        type="file"
                                        // @ts-expect-error webkitdirectory is non-standard
                                        webkitdirectory=""
                                        multiple
                                        className="hidden"
                                        ref={folderInputRef}
                                        onChange={handleUpdateGallery}
                                    />
                                </div>

                                <div className="text-center p-6 border-2 border-dashed rounded-lg hover:bg-accent/50 cursor-pointer flex flex-col items-center justify-center gap-2"
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.multiple = true;
                                        input.accept = "image/*";
                                        input.onchange = (e) => handleUpdateGallery(e as any);
                                        input.click();
                                    }}>
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm font-medium">Seleccionar Fotos</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {mode === "download" && (
                        <div className="text-center">
                            <p className="mb-4 text-sm text-muted-foreground">
                                Se descargará un archivo CSV con {currentGallery.length} fotos.
                            </p>
                            <button
                                onClick={handleDownloadGallery}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2 mx-auto"
                            >
                                <Download className="h-4 w-4" /> Descargar CSV
                            </button>
                        </div>
                    )}

                    {loading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Procesando...</span>
                                {mode === "update" && <span>{progress.current} / {progress.total}</span>}
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: progress.total ? `${(progress.current / progress.total) * 100}%` : '100%' }}
                                />
                            </div>
                        </div>
                    )}

                    {error && <p className="text-sm text-destructive text-center">{error}</p>}
                </div>
            </div>
        </div>
    );
}
