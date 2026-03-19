import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { PhotoMetadata } from "@/types";
import { ChevronLeft, ChevronRight, Info, Tag, Calendar, Monitor, FileType, HardDrive, Download, Trash2 } from "lucide-react";

interface GalleryViewerProps {
    photos: Partial<PhotoMetadata>[];
    onDelete?: (photo: Partial<PhotoMetadata>) => void;
}

export function GalleryViewer({ photos = [], onDelete }: GalleryViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [prevPhotos, setPrevPhotos] = useState(photos);

    if (photos !== prevPhotos) {
        setPrevPhotos(photos);
        setCurrentIndex(0);
    }

    const handleNext = useCallback(() => {
        if (photos.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, [photos.length]);

    const handlePrev = useCallback(() => {
        if (photos.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }, [photos.length]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleNext, handlePrev]);

    // Helper to get image source
    const getImageSrc = (path?: string) => {
        if (!path) return "";
        if (path.includes('blob:') || path.startsWith('data:')) return path;
        // Strip any existing protocols to avoid duplication
        let cleanPath = path
            .replace(/^file:\/\/\//, '')
            .replace(/^local-file:\/\//, '')
            .replace(/^mifoto:\/\/-\//, '')
            .replace(/^mifoto:\/\/\//, '')
            .replace(/^mifoto:\/\//, '');

        // On Windows, ensure we don't end up with /C:/..., we want C:/...
        if (cleanPath.startsWith('/') && cleanPath.match(/^\/[a-zA-Z]:/)) {
            // It's like /C:/Users... which becomes C:/Users...
            cleanPath = cleanPath.substring(1);
        }
        // URIs must use forward slashes, replace windows backslashes
        cleanPath = cleanPath.replace(/\\/g, '/');
        // Encode URI components to handle spaces and special chars safely in Chrome network stack
        const parts = cleanPath.split('/');
        const encodedPath = parts.map(p => encodeURIComponent(p)).join('/');
        return `mifoto://-/${encodedPath}`;
    };



    if (!photos || photos.length === 0) {
        return (
            <div className="text-center p-20 text-muted-foreground">
                No hay fotos para mostrar.
            </div>
        );
    }

    const photo = photos[currentIndex];

    // Safety check if index is out of bounds or photo is undefined
    if (!photo) {
        return (
            <div className="flex items-center justify-center h-[50vh] text-muted-foreground">
                Selecciona una foto.
            </div>
        );
    }

    const handleDownload = () => {
        if (!photo.path) return;

        const link = document.createElement('a');
        link.href = getImageSrc(photo.path);
        link.download = photo.filename || 'download.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = () => {
        if (onDelete && confirm(`¿Estás seguro de que deseas eliminar "${photo.filename}" de la galería?`)) {
            onDelete(photo);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-[80vh] gap-6">
            {/* ... (Left: Image Viewer) */}

            <div className="flex-1 relative bg-black/5 rounded-xl border flex items-center justify-center overflow-hidden group">
                {/* ... (Navigation Buttons) */}

                {/* Download Button (New) */}
                <button
                    onClick={handleDownload}
                    className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
                    title="Descargar Imagen"
                >
                    <Download className="h-5 w-5 text-gray-700" />
                </button>

                {/* ... (Counter Badge & Main Image) */}
                {/* Navigation Buttons */}
                <button
                    onClick={handlePrev}
                    className="absolute left-4 z-10 p-2.5 rounded-full bg-black/40 hover:bg-primary text-white shadow-xl backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 border border-white/10 hover:scale-110 active:scale-95"
                    title="Anterior (Flecha Izquierda)"
                >
                    <ChevronLeft className="h-7 w-7" />
                </button>

                <button
                    onClick={handleNext}
                    className="absolute right-4 z-10 p-2.5 rounded-full bg-black/40 hover:bg-primary text-white shadow-xl backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 border border-white/10 hover:scale-110 active:scale-95"
                    title="Siguiente (Flecha Derecha)"
                >
                    <ChevronRight className="h-7 w-7" />
                </button>

                {/* Counter Badge */}
                <div className="absolute top-4 right-4 z-10 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md">
                    {currentIndex + 1} / {photos.length}
                </div>

                {/* Main Image or Video */}
                <div className="relative w-full h-full p-4 flex items-center justify-center">
                    {photo.path && (
                        ['mp4', 'webm', 'mov', 'avi'].includes((photo.format || '').toLowerCase()) ? (
                            <video
                                key={`video-${photo.path || currentIndex}`}
                                src={getImageSrc(photo.path)}
                                className="w-full h-full object-contain drop-shadow-2xl bg-black/5"
                                controls
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="auto"
                            />
                        ) : (
                            <img
                                key={photo.path || currentIndex}
                                src={getImageSrc(photo.path)}
                                alt={photo.filename || "Gallery Image"}
                                className="object-contain w-full h-full drop-shadow-2xl"
                            />
                        )
                    )}
                </div>
            </div>

            {/* Right: Metadata Panel */}
            <div className="w-full lg:w-96 bg-card border rounded-xl shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg truncate" title={photo.filename}>
                            {photo.filename}
                        </h3>
                        {onDelete && (
                            <button
                                onClick={handleDelete}
                                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                title="Eliminar de la galería"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1.5 font-medium">
                            <FileType className="h-3 w-3 text-orange-500" /> {photo.format?.toUpperCase()}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="flex items-center gap-1.5 font-medium">
                            <HardDrive className="h-3 w-3 text-blue-500" /> {photo.file_size_kb} KB
                        </span>
                        {photo.date_taken && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Calendar className="h-3 w-3 text-green-500" /> {new Date(photo.date_taken).toLocaleString()}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Technical Specs */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-muted/20 rounded-lg">
                            <span className="text-xs text-muted-foreground block mb-1">Resolución</span>
                            <div className="font-medium flex items-center gap-1">
                                <Monitor className="h-3 w-3 text-indigo-500" />
                                {photo.resolution || (photo.width && photo.height ? `${photo.width} x ${photo.height}` : 'Desconocida')}
                            </div>
                        </div>
                        <div className="p-3 bg-muted/20 rounded-lg">
                            <span className="text-xs text-muted-foreground block mb-1">Relación Aspecto</span>
                            <div className="font-medium">{photo.aspect_ratio || "-"}</div>
                        </div>
                    </div>

                    {/* AI Analysis */}
                    {photo.description && (
                        <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                                <Info className="h-4 w-4 text-blue-500" />
                                Descripción AI
                            </h4>
                            <p className="text-sm text-muted-foreground italic leading-relaxed bg-blue-50/50 p-3 rounded-md border border-blue-100">
                                {photo.description}
                            </p>
                        </div>
                    )}

                    {/* Descriptive Tags */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <DetailRow label="Escena" value={photo.scene_type} />
                            <DetailRow label="Entorno" value={photo.setting} />
                            <DetailRow label="Iluminación" value={photo.lighting} />
                            <DetailRow label="Color" value={photo.color_palette} />
                            <DetailRow label="Estilo" value={photo.style} />
                            <DetailRow label="Ánimo" value={photo.mood} />
                            <DetailRow label="Sujeto Principal" value={photo.main_subject} />
                            <DetailRow label="Acción" value={photo.action} />
                        </div>
                    </div>

                    {/* Tags */}
                    {photo.tags && photo.tags.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                                <Tag className="h-4 w-4 text-purple-500" />
                                Etiquetas Detected
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {photo.tags.map(tag => (
                                    <span key={tag} className="text-xs px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md border border-purple-100">
                                        #{tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Text Content */}
                    {photo.has_text && photo.text_content && (
                        <div className="bg-yellow-50/50 p-3 rounded-lg border border-yellow-100">
                            <span className="text-xs font-semibold text-yellow-700 block mb-1">Texto Detectado</span>
                            <p className="text-xs text-muted-foreground font-mono bg-white/50 p-2 rounded">
                                {photo.text_content}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string, value?: string }) {
    if (!value) return null;
    return (
        <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
            <span className="font-medium text-foreground">{value}</span>
        </div>
    );
}
