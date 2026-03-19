"use client";

import { useState, useRef, useEffect } from "react";
import { FolderPlus, Download, X, FileText, Image as ImageIcon } from "lucide-react";
import { PhotoMetadata } from "@/types";
import { parseCSV, generateCSV } from "@/lib/client-csv-utils";
import { analyzeImageClient } from "@/lib/client-ai-service";
import { getImageDimensions } from "@/lib/utils";

interface GalleryManagerProps {
    isOpen: boolean;
    mode: "select" | "update" | "download";
    onClose: () => void;
    currentGallery: Partial<PhotoMetadata>[];
    onGalleryUpdate: (newGallery: Partial<PhotoMetadata>[]) => void;
}

import { useConsole } from "@/context/ConsoleContext";

export function GalleryManager(props: GalleryManagerProps) {
    const { isOpen, mode, onClose, onGalleryUpdate } = props;
    const currentGallery = props.currentGallery || [];
    const { addLog } = useConsole();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [error, setError] = useState("");
    const [basePath, setBasePath] = useState("");
    const basePathInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus the input when it opens in update mode or when mode changes to update
    useEffect(() => {
        if (isOpen && mode === "update") {
            const timer = setTimeout(() => {
                if (basePathInputRef.current) {
                    basePathInputRef.current.focus();
                    basePathInputRef.current.select();
                }
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen, mode]);

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

    const processElectronAssets = async (assets: Partial<PhotoMetadata>[]) => {
        const finalImages = [];
        setProgress({ current: 0, total: assets.length });

        for (let i = 0; i < assets.length; i++) {
            const img = assets[i];
            const filePath = img.path || (img as any).realPath;

            if (filePath && !img.description) {
                addLog(`Analizando [${i + 1}/${assets.length}]: ${img.filename}...`, "info");
                try {
                    const analysis = await window.electronAPI!.analyzeImage(filePath);
                    if (analysis.success && analysis.data) {
                        const width = analysis.data.width || 0;
                        const height = analysis.data.height || 0;
                        finalImages.push({
                            ...img,
                            ...analysis.data,
                            date_added: new Date().toISOString(),
                            realPath: filePath,
                            path: filePath,
                            orientation: (width > height ? 'horizontal' : width < height ? 'vertical' : 'square') as "horizontal" | "vertical" | "square",
                        });
                        addLog(`IA Completada para ${img.filename}. Etiquetas: ${analysis.data.tags?.length || 0}`, "success");
                    } else {
                        finalImages.push({ ...img, realPath: filePath, path: filePath });
                        addLog(`Error al analizar ${img.filename}: ${analysis.error}`, "error");
                    }
                } catch (err: any) {
                    finalImages.push({ ...img, realPath: filePath, path: filePath });
                    addLog(`Error fatal analizando ${img.filename}: ${err.message}`, "error");
                }
            } else {
                finalImages.push({ ...img, realPath: filePath, path: img.path?.startsWith('mifoto://') ? img.path.replace('mifoto://', '') : (img.path || filePath) });
            }
            setProgress(prev => ({ ...prev, current: i + 1 }));
        }

        onGalleryUpdate([...currentGallery, ...finalImages]);
        onClose();
    };

    const handleSelectFilesElectron = async () => {
        if (!window.electronAPI) return;

        setLoading(true);
        setError("");
        try {
            addLog("Abriendo selector de archivos nativo...", "info");
            const filePaths = await window.electronAPI.selectFiles();

            if (filePaths && filePaths.length > 0) {
                addLog(`Seleccionados ${filePaths.length} archivos. Preparando análisis...`, "info");

                const assetsToProcess: Partial<PhotoMetadata>[] = filePaths.map(fp => {
                    const filename = fp.split(/[\\/]/).pop() || fp;
                    return {
                        filename,
                        path: fp,
                        realPath: fp,
                        date_added: new Date().toISOString()
                    };
                });

                await processElectronAssets(assetsToProcess);
            }
        } catch (e: any) {
            setError(e.message || "Error al seleccionar archivos.");
            addLog(`Error en selección: ${e.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (!basePath.trim()) {
            setError("Debes introducir la Ruta Base en el cuadro de texto antes de cargar imágenes.");
            addLog("Intento de carga sin Ruta Base", "warning");
            return;
        }

        setLoading(true);
        setError("");
        setProgress({ current: 0, total: files.length });
        addLog(`Iniciando actualización con ${files.length} archivos detectados.`, "info");

        const newPhotos: Partial<PhotoMetadata>[] = [];
        const imageFiles = Array.from(files).filter(f => f.type.startsWith("image/") || f.type.startsWith("video/"));

        addLog(`Filtrado: ${imageFiles.length} archivos multimedia válidos encontrados.`, "info");
        setProgress({ current: 0, total: imageFiles.length });

        const cleanBasePath = basePath.replace(/[\\/]$/, '');

        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const filePath = file.webkitRelativePath || file.name;
            let finalPath = '';

            if (filePath.includes('/')) {
                const rootFolderMatch = filePath.split('/')[0];
                if (cleanBasePath.endsWith(rootFolderMatch)) {
                    finalPath = cleanBasePath + '/' + filePath.substring(rootFolderMatch.length + 1);
                } else {
                    finalPath = cleanBasePath + '/' + filePath;
                }
            } else {
                finalPath = cleanBasePath + '/' + filePath;
            }
            const realPath = finalPath.replace(/\//g, '\\');

            try {
                const url = URL.createObjectURL(file);
                const { width, height } = await getImageDimensions(file);

                addLog(`Analizando [${i + 1}/${imageFiles.length}]: ${file.name}...`, "info");

                const aiData = await analyzeImageClient(file);
                addLog(`IA Completada para ${file.name}. Etiquetas: ${aiData.tags?.length || 0}`, "success");

                newPhotos.push({
                    description: "",
                    tags: [],
                    ...aiData,
                    date_added: new Date().toISOString(),
                    date_taken: aiData.date_taken || new Date(file.lastModified).toISOString(),
                    filename: file.name,
                    path: url,
                    realPath,
                    format: file.type.split('/')[1],
                    file_size_kb: Math.round(file.size / 1024),
                    width,
                    height,
                    resolution: getResolutionLabel(width, height),
                    aspect_ratio: getAspectRatio(width, height),
                    orientation: width > height ? 'horizontal' : width < height ? 'vertical' : 'square',
                });

            } catch (err: any) {
                const errMsg = `Error analizando ${file.name}: ${err.message}`;
                console.error(errMsg, err);
                addLog(errMsg, "error");

                newPhotos.push({
                    filename: file.name,
                    path: URL.createObjectURL(file),
                    realPath,
                    file_size_kb: Math.round(file.size / 1024),
                    format: file.type.split('/')[1],
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
            const cleanGallery = currentGallery.map((p: Partial<PhotoMetadata> & { realPath?: string }) => {
                const { realPath, ...rest } = p;
                return {
                    ...rest,
                    path: realPath || (p.path?.startsWith('blob:') ? p.filename : p.path)
                };
            });

            const csv = generateCSV(cleanGallery);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const date = new Date();
            const dateStr = date.toISOString().split('T')[0].replace(/-/g, '_');
            const a = document.createElement('a');
            a.href = url;
            a.download = `mis-fotos-galeria_${dateStr}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            onClose();
        } catch {
            setError("Error al generar el CSV.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md rounded-2xl shadow-premium border p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                        {mode === "select" && "Seleccionar Galería (CSV)"}
                        {mode === "update" && "Actualizar Galería"}
                        {mode === "download" && "Descargar Galería"}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-accent/50 rounded-lg transition-colors"><X className="h-4 w-4" /></button>
                </div>

                <div className="space-y-4">
                    {mode === "select" && (
                        <div className="space-y-4">
                            <div className="w-full p-4 border-2 border-dashed rounded-2xl hover:bg-accent/50 transition-colors cursor-pointer text-center hover:shadow-md"
                                onClick={() => csvInputRef.current?.click()}>
                                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
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

                            <div className="w-full">
                                <button
                                    onClick={handleNewGallery}
                                    className="w-full py-4 border rounded-2xl hover:bg-accent/50 transition-colors flex flex-col items-center justify-center gap-2 group hover:shadow-md cursor-pointer"
                                >
                                    <FolderPlus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span className="font-medium group-hover:text-primary transition-colors">Iniciar Nueva Galería Vacía</span>
                                </button>
                            </div>

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
                                <label htmlFor="basePath" className="text-sm font-medium">Ruta Base (Requerido)*</label>
                                <input
                                    ref={basePathInputRef}
                                    id="basePath"
                                    type="text"
                                    value={basePath}
                                    onChange={(e) => setBasePath(e.target.value)}
                                    placeholder="Ej: C:\MisFotos\Vacaciones"
                                    className="w-full p-3 border-2 border-primary/20 rounded-xl bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-foreground placeholder:text-muted-foreground/50 shadow-sm"
                                    required
                                    autoComplete="off"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="text-center p-6 border-2 border-dashed rounded-2xl hover:bg-accent/50 cursor-pointer flex flex-col items-center justify-center gap-2 hover:shadow-md group transition-all"
                                    onClick={() => {
                                        if (window.electronAPI) {
                                            handleSelectFilesElectron();
                                        } else {
                                            folderInputRef.current?.click();
                                        }
                                    }}>
                                    <ImageIcon className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <p className="text-sm font-medium group-hover:text-primary transition-colors">Seleccionar Fotos</p>
                                </div>

                                <div className="text-center p-6 border-2 border-dashed rounded-2xl hover:bg-accent/50 cursor-pointer flex flex-col items-center justify-center gap-2 hover:shadow-md group transition-all"
                                    onClick={async () => {
                                        if (window.electronAPI) {
                                            const dirPath = await window.electronAPI.selectDirectory();
                                            if (dirPath) {
                                                setLoading(true);
                                                try {
                                                    addLog(`Escaneando directorio: ${dirPath}`, "info");
                                                    const result = await window.electronAPI.scanDirectory(dirPath);
                                                    if (result.success && result.images) {
                                                        await processElectronAssets(result.images);
                                                    } else {
                                                        setError(result.error || "Error al escanear.");
                                                    }
                                                } catch (e: any) {
                                                    setError(e.message || "Error desconocido");
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }
                                        } else {
                                            setError("Debes ejecutar la aplicación de escritorio para escanear carpetas locales.");
                                        }
                                    }}>
                                    <FolderPlus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <p className="text-sm font-medium group-hover:text-primary transition-colors">Escanear Carpeta</p>
                                </div>
                            </div>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                className="hidden"
                                ref={folderInputRef}
                                onChange={handleUpdateGallery}
                            />
                        </div>
                    )}

                    {mode === "download" && (
                        <div className="text-center">
                            <p className="mb-4 text-sm text-muted-foreground">
                                Se descargará un archivo CSV con {currentGallery.length} fotos.
                            </p>
                            <div>
                                <button
                                    onClick={handleDownloadGallery}
                                    className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl flex items-center gap-2 mx-auto hover:bg-primary/90 transition-colors hover:scale-[1.02] shadow-md hover:shadow-premium"
                                >
                                    <Download className="h-4 w-4" /> Descargar CSV
                                </button>
                            </div>
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
