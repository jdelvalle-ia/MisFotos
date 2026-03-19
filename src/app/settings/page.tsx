"use client";

import { ConnectionStatusWidget } from "@/components/settings/ConnectionStatusWidget";
import { MaintenanceWidget } from "@/components/settings/MaintenanceWidget";
import { useState, useEffect } from "react";
import { PhotoMetadata } from "@/types";
import { useConsole } from "@/context/ConsoleContext";

export default function SettingsPage() {
    const [photos, setPhotos] = useState<Partial<PhotoMetadata>[]>([]);
    const { addLog } = useConsole();

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

    const handleGalleryUpdate = (newPhotos: Partial<PhotoMetadata>[]) => {
        setPhotos(newPhotos);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 drop-shadow-sm pb-1">Configuración</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <ConnectionStatusWidget />
                <MaintenanceWidget photos={photos} onGalleryUpdate={handleGalleryUpdate} />
            </div>
        </div>
    );
}
