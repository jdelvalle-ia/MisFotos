"use client";

import Image from "next/image";
import { PhotoMetadata } from "@/types";
import { ImageOff } from "lucide-react";

interface GalleryGridProps {
    photos: Partial<PhotoMetadata>[];
}

export function GalleryGrid({ photos = [] }: GalleryGridProps) {
    if (!photos || photos.length === 0) {
        return (
            <div className="text-center p-20 border-2 border-dashed rounded-lg bg-muted/50">
                <ImageOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No hay fotos en la galería</h3>
                <p className="text-muted-foreground mt-2">
                    Selecciona una galería CSV o actualiza con nuevas fotos.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {photos.map((photo, index) => (
                <div
                    key={`${photo.path}-${index}`}
                    className="group relative aspect-square bg-muted rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                    {photo.path && (
                        <Image
                            src={photo.path.includes('blob:') ? photo.path : `/api/images?path=${encodeURIComponent(photo.path)}`}
                            alt={photo.filename || "Photo"}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                        />
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
                    </div>
                </div>
            ))}
        </div>
    );
}
