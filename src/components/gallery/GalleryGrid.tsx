"use client";

import Image from "next/image";
import { PhotoMetadata } from "@/types";
import { ImageOff, Trash2 } from "lucide-react";
import { useEffect } from "react";

interface GalleryGridProps {
    photos: Partial<PhotoMetadata>[];
    onDelete?: (photo: Partial<PhotoMetadata>) => void;
}

export function GalleryGrid({ photos = [], onDelete }: GalleryGridProps) {
    if (!photos || photos.length === 0) {
        return (
            <div className="text-center p-20 border-2 border-dashed rounded-2xl bg-muted/50">
                <ImageOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No hay fotos en la galería</h3>
                <p className="text-muted-foreground mt-2">
                    Selecciona una galería CSV o actualiza con nuevas fotos.
                </p>
            </div>
        );
    }

    const getTargetSrc = (path?: string) => {
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

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {photos.map((photo, index) => (
                <div
                    key={`${photo.path}-${index}`}
                    className="group relative w-full aspect-square bg-muted rounded-2xl overflow-hidden border shadow-sm hover:shadow-premium transition-all duration-300 cursor-pointer hover:border-primary/50"
                >
                    {photo.path && (
                        ['mp4', 'webm', 'mov', 'avi'].includes((photo.format || '').toLowerCase()) ? (
                            <video
                                src={getTargetSrc(photo.path)}
                                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                                muted
                                playsInline
                                onMouseEnter={(e) => e.currentTarget.play().catch(() => { })}
                                onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                            />
                        ) : (
                            <img
                                src={getTargetSrc(photo.path)}
                                alt={photo.filename || "Photo"}
                                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                            />
                        )
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <p className="text-white text-xs font-medium truncate">{photo.filename}</p>
                        {photo.tags && photo.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {photo.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`¿Eliminar "${photo.filename}" de la galería?`)) {
                                        onDelete(photo);
                                    }
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white hover:bg-destructive rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Eliminar de la galería"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
