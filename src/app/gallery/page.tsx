"use client";

import { useState, useEffect, useMemo } from "react";
import { GalleryViewer } from "@/components/gallery/GalleryViewer";
import { GalleryFilters, GalleryFiltersState, initialFilters } from "@/components/gallery/GalleryFilters";
import { PhotoMetadata } from "@/types";

export default function GalleryPage() {
    const [photos, setPhotos] = useState<Partial<PhotoMetadata>[]>([]);
    const [filters, setFilters] = useState<GalleryFiltersState>(initialFilters);

    useEffect(() => {
        const saved = localStorage.getItem("gallery_photos");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setPhotos(parsed);
                }
            } catch (e) {
                console.error("Failed to load gallery", e);
            }
        }
    }, []);

    const filteredPhotos = useMemo(() => {
        return photos.filter(photo => {
            // Search Text
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const textMatch =
                    photo.description?.toLowerCase().includes(searchLower) ||
                    photo.main_subject?.toLowerCase().includes(searchLower) ||
                    photo.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
                    (photo.has_text && photo.text_content?.toLowerCase().includes(searchLower));

                if (!textMatch) return false;
            }

            // Dropdowns
            if (filters.resolution !== "Todas" && photo.resolution !== filters.resolution) return false;
            if (filters.aspect_ratio !== "Todos" && photo.aspect_ratio !== filters.aspect_ratio) return false;
            if (filters.orientation !== "Todas" && photo.orientation !== filters.orientation) return false;
            if (filters.scene_type !== "Todos" && photo.scene_type !== filters.scene_type) return false;
            if (filters.setting !== "Todos" && photo.setting !== filters.setting) return false;
            if (filters.lighting !== "Todas" && photo.lighting !== filters.lighting) return false;
            if (filters.color_palette !== "Todas" && photo.color_palette !== filters.color_palette) return false;
            if (filters.style !== "Todos" && photo.style !== filters.style) return false;
            if (filters.mood !== "Todos" && photo.mood !== filters.mood) return false;

            // Boolean check
            if (filters.has_text !== "Todos") {
                const hasText = filters.has_text === "Si";
                if (photo.has_text !== hasText) return false;
            }

            return true;
        });
    }, [photos, filters]);

    return (
        <div className="h-[calc(100vh-theme(spacing.20))] flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold tracking-tight">Galería Completa</h2>
            </div>

            <GalleryFilters
                photos={photos}
                filters={filters}
                onFilterChange={setFilters}
                totalResults={filteredPhotos.length}
            />

            <div className="flex-1 min-h-0">
                <GalleryViewer photos={filteredPhotos} />
            </div>
        </div>
    );
}
