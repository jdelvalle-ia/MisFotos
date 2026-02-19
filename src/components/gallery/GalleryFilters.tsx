"use client";

import { useState, useMemo } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { PhotoMetadata } from "@/types";

export interface GalleryFiltersState {
    search: string;
    resolution: string;
    aspect_ratio: string;
    orientation: string;
    scene_type: string;
    setting: string;
    lighting: string;
    color_palette: string;
    style: string;
    mood: string;
    has_text: string;
}

export const initialFilters: GalleryFiltersState = {
    search: "",
    resolution: "Todas",
    aspect_ratio: "Todos",
    orientation: "Todas",
    scene_type: "Todos",
    setting: "Todos",
    lighting: "Todas",
    color_palette: "Todas",
    style: "Todos",
    mood: "Todos",
    has_text: "Todos",
};

interface GalleryFiltersProps {
    photos: Partial<PhotoMetadata>[];
    filters: GalleryFiltersState;
    onFilterChange: (newFilters: GalleryFiltersState) => void;
    totalResults: number;
}

export function GalleryFilters({ photos, filters, onFilterChange, totalResults }: GalleryFiltersProps) {
    const [isOpen, setIsOpen] = useState(true);

    // Extract unique options for each filter category
    const options = useMemo(() => {
        const extract = (key: keyof PhotoMetadata) => {
            const values = new Set<string>();
            photos.forEach(p => {
                const val = p[key];
                if (typeof val === 'string' && val) values.add(val);
            });
            return Array.from(values).sort();
        };

        return {
            resolution: extract('resolution'),
            aspect_ratio: extract('aspect_ratio'),
            orientation: extract('orientation'),
            scene_type: extract('scene_type'),
            setting: extract('setting'),
            lighting: extract('lighting'),
            color_palette: extract('color_palette'),
            style: extract('style'),
            mood: extract('mood'),
        };
    }, [photos]);

    const handleChange = (key: keyof GalleryFiltersState, value: string) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const handleReset = () => {
        onFilterChange(initialFilters);
    };

    return (
        <div className="bg-card border rounded-lg shadow-sm mb-6 overflow-hidden">
            <div
                className="p-4 flex items-center justify-between cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    <h3 className="font-medium text-sm">Filtros y Búsqueda</h3>
                    <span className="text-xs text-muted-foreground ml-2">
                        ({totalResults} imagen{totalResults !== 1 ? 'es' : ''} encontrada{totalResults !== 1 ? 's' : ''})
                    </span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="p-4 space-y-4 border-t">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por descripción, texto o tags..."
                            className="w-full pl-9 pr-4 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={filters.search}
                            onChange={(e) => handleChange('search', e.target.value)}
                        />
                        {filters.search && (
                            <button
                                onClick={() => handleChange('search', '')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>

                    {/* Filter Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        <FilterSelect
                            label="Resolución"
                            value={filters.resolution}
                            options={options.resolution}
                            onChange={(v) => handleChange('resolution', v)}
                            defaultLabel="Todas"
                        />
                        <FilterSelect
                            label="Aspecto"
                            value={filters.aspect_ratio}
                            options={options.aspect_ratio}
                            onChange={(v) => handleChange('aspect_ratio', v)}
                            defaultLabel="Todos"
                        />
                        <FilterSelect
                            label="Orientación"
                            value={filters.orientation}
                            options={options.orientation}
                            onChange={(v) => handleChange('orientation', v)}
                            defaultLabel="Todas"
                        />
                        <FilterSelect
                            label="Tipo de Escena"
                            value={filters.scene_type}
                            options={options.scene_type}
                            onChange={(v) => handleChange('scene_type', v)}
                            defaultLabel="Todos"
                        />
                        <FilterSelect
                            label="Escenario"
                            value={filters.setting}
                            options={options.setting}
                            onChange={(v) => handleChange('setting', v)}
                            defaultLabel="Todos"
                        />
                        <FilterSelect
                            label="Iluminación"
                            value={filters.lighting}
                            options={options.lighting}
                            onChange={(v) => handleChange('lighting', v)}
                            defaultLabel="Todas"
                        />
                        <FilterSelect
                            label="Paleta de Color"
                            value={filters.color_palette}
                            options={options.color_palette}
                            onChange={(v) => handleChange('color_palette', v)}
                            defaultLabel="Todas"
                        />
                        <FilterSelect
                            label="Estilo"
                            value={filters.style}
                            options={options.style}
                            onChange={(v) => handleChange('style', v)}
                            defaultLabel="Todos"
                        />
                        <FilterSelect
                            label="Estado de Ánimo"
                            value={filters.mood}
                            options={options.mood}
                            onChange={(v) => handleChange('mood', v)}
                            defaultLabel="Todos"
                        />
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Contiene Texto</label>
                            <select
                                className="w-full p-2 bg-background text-foreground border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={filters.has_text}
                                onChange={(e) => handleChange('has_text', e.target.value)}
                            >
                                <option value="Todos" className="bg-background text-foreground">Todos</option>
                                <option value="Si" className="bg-background text-foreground">Sí</option>
                                <option value="No" className="bg-background text-foreground">No</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleReset}
                            className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
                        >
                            <X className="h-3 w-3" />
                            Resetear filtros
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

interface FilterSelectProps {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
    defaultLabel?: string;
}

function FilterSelect({ label, value, options, onChange, defaultLabel = "Todos" }: FilterSelectProps) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            <select
                className="w-full p-2 bg-background text-foreground border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value={defaultLabel} className="bg-background text-foreground">{defaultLabel}</option>
                {options.map(opt => (
                    <option key={opt} value={opt} className="bg-background text-foreground">{opt}</option>
                ))}
            </select>
        </div>
    );
}
