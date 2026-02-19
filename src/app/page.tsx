"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, UploadCloud, FileText, Download } from "lucide-react";
import { StatsWidget } from "@/components/dashboard/StatsWidget";
import { ActionCard } from "@/components/dashboard/ActionCard";
import { GalleryManager } from "@/components/gallery/GalleryManager";
import { PhotoMetadata } from "@/types";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { generateCSV } from "@/lib/client-csv-utils";

export default function Dashboard() {
  const [photos, setPhotos] = useState<Partial<PhotoMetadata>[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("gallery_photos");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log("Dashboard: Loaded", parsed.length, "photos from storage");
          setPhotos(parsed);
        }
      } catch (e) {
        console.error("Failed to load gallery from storage", e);
      }
    }
  }, []);

  // Gallery Manager State
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [managerMode, setManagerMode] = useState<"select" | "update" | "download">("select");

  // Computed Stats
  const stats = {
    totalPhotos: photos.length,
    processed: photos.filter(p => p.description || (p.tags && p.tags.length > 0)).length,
    tags: new Set(photos.flatMap(p => p.tags || [])).size
  };

  const handleOpenManager = (mode: "select" | "update" | "download") => {
    setManagerMode(mode);
    setIsManagerOpen(true);
  };

  const handleGalleryUpdate = (newPhotos: Partial<PhotoMetadata>[]) => {
    console.log("Dashboard: Updating gallery with", newPhotos.length, "photos");
    setPhotos(newPhotos);
  };

  const handleDirectDownload = () => {
    if (photos.length === 0) {
      alert("No hay fotos para descargar.");
      return;
    }

    try {
      const cleanGallery = photos.map((p: any) => {
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
    } catch (err) {
      console.error("Error downloading CSV", err);
      alert("Error generando el archivo CSV.");
    }
  };

  // Save to localStorage whenever photos change
  useEffect(() => {
    if (photos.length > 0) {
      localStorage.setItem("gallery_photos", JSON.stringify(photos));
    }
    console.log("Dashboard: Current photos state:", photos.length);
  }, [photos]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsWidget
          title="Total Fotos"
          value={stats.totalPhotos}
          icon={ImageIcon}
          description="Imágenes en la galería"
        />
        <StatsWidget
          title="Procesadas con IA"
          value={stats.processed}
          icon={UploadCloud}
          description="Fotos analizadas"
        />
        <StatsWidget
          title="Etiquetas Únicas"
          value={stats.tags}
          icon={FileText}
          description="Categorías descubiertas"
        />
      </div>

      {/* Main Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <ActionCard
          title="Seleccionar Galería"
          description="Cargar archivo CSV de galería existente"
          icon={FileText}
          onClick={() => handleOpenManager("select")}
        />
        <ActionCard
          title="Actualizar Galería"
          description="Analizar nuevas carpetas con IA"
          icon={UploadCloud}
          onClick={() => handleOpenManager("update")}
        />
        <ActionCard
          title="Descargar Galería"
          description="Exportar datos a CSV inmediatamente"
          icon={Download}
          onClick={handleDirectDownload}
        />
      </div>

      {/* Recent Activity / Gallery Preview */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Galería</h3>
        {photos.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No hay fotos cargadas. Selecciona una galería o actualiza para comenzar.</p>
          </div>
        ) : (
          <GalleryGrid photos={photos} />
        )}
      </div>

      <GalleryManager
        isOpen={isManagerOpen}
        mode={managerMode}
        currentGallery={photos}
        onClose={() => setIsManagerOpen(false)}
        onGalleryUpdate={handleGalleryUpdate}
      />
    </div>
  );
}
