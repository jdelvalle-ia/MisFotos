"use server";

import fs from 'fs';
import path from 'path';
import { PhotoMetadata } from '@/types';
import { parseCSV, generateCSV } from '@/lib/csv-utils';
import { addScannedDirectory, getScannedDirectories as getDirs } from '@/lib/config';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Recursive scan function
function scanDirRecursive(dirPath: string, fileList: string[] = []) {
    try {
        const files = fs.readdirSync(dirPath);
        files.forEach((file) => {
            const fullPath = path.join(dirPath, file);
            if (fs.statSync(fullPath).isDirectory()) {
                scanDirRecursive(fullPath, fileList);
            } else {
                if (IMAGE_EXTENSIONS.includes(path.extname(fullPath).toLowerCase())) {
                    fileList.push(fullPath);
                }
            }
        });
    } catch (err) {
        console.error(`Skipping directory ${dirPath}:`, err);
    }
    return fileList;
}

export async function scanDirectory(dirPath: string) {
    try {
        if (!fs.existsSync(dirPath)) {
            return { error: `Directorio no encontrado: ${dirPath}` };
        }

        const stats = fs.statSync(dirPath);
        if (!stats.isDirectory()) {
            return { error: `La ruta no es un directorio: ${dirPath}` };
        }

        // Load existing CSV if present
        const csvPath = path.join(dirPath, 'photos.csv');
        const existingMetadata: Record<string, Partial<PhotoMetadata>> = {};

        if (fs.existsSync(csvPath)) {
            try {
                const csvContent = fs.readFileSync(csvPath, 'utf-8');
                const parsed = await parseCSV(csvContent);
                parsed.forEach(p => {
                    // Use path as key
                    if (p.path) existingMetadata[p.path] = p;
                });
            } catch (err) {
                console.warn("Could not read existing CSV, starting fresh for scan:", err);
            }
        }

        const imagePaths = scanDirRecursive(dirPath);
        const images: Partial<PhotoMetadata>[] = imagePaths.map(fullPath => {
            const stats = fs.statSync(fullPath);
            const basicData = {
                filename: path.basename(fullPath),
                path: fullPath,
                file_size_kb: Math.round(stats.size / 1024),
                format: path.extname(fullPath).replace('.', ''),
            };

            // Merge with existing metadata if found
            if (existingMetadata[fullPath]) {
                return {
                    ...basicData, // Update basic stats like size in case they changed
                    ...existingMetadata[fullPath], // Keep tags/analysis
                    // Ensure we don't accidentally overwrite basic data with stale data if we wanted to (but here we prioritize existing metadata for enriched fields, and FS for physical props)
                    // Actually, let's explicit:
                    // We want to keep: tags, scene_type, etc.
                    // We want to update: size? maybe.
                };
            }

            return {
                ...basicData,
                // Default values for new items
                orientation: 'horizontal',
                has_text: false,
                tags: []
            };
        });

        return { success: true, count: images.length, images };
    } catch (error) {
        console.error("Scan error:", error);
        return { error: "Error al escanear el directorio." };
    }
}

export async function saveCsv(filePath: string, data: Partial<PhotoMetadata>[]) {
    try {
        const csvContent = generateCSV(data);
        fs.writeFileSync(filePath, csvContent, 'utf-8');
        return { success: true };
    } catch (error) {
        console.error("Save CSV error:", error);
        return { error: "Error al guardar el archivo CSV." };
    }
}

import { analyzeImage } from '@/lib/ai-service';

export async function analyzeFile(filePath: string): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
        if (!fs.existsSync(filePath)) {
            return { success: false, error: "Archivo no encontrado" };
        }

        const fileBuffer = fs.readFileSync(filePath);
        const base64 = fileBuffer.toString('base64');
        const mimeType = filePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

        const analysis = await analyzeImage(base64, mimeType);
        return { success: true, data: analysis };

    } catch (error) {
        console.error("Analyze error:", error);
        return { success: false, error: "Error al analizar la imagen" };
    }
}

export async function loadCsv(filePath: string) {
    try {
        if (!fs.existsSync(filePath)) {
            return { success: false, error: "Archivo CSV no encontrado." };
        }
        const csvContent = fs.readFileSync(filePath, 'utf-8');
        const data = await parseCSV(csvContent);
        return { success: true, data };
    } catch (error) {
        console.error("Load CSV error:", error);
        return { error: "Error al leer el archivo CSV." };
    }
}

export async function saveScannedDirectory(dirPath: string) {
    try {
        addScannedDirectory(dirPath);
        return { success: true };
    } catch (error) {
        console.error("Error saving directory config:", error);
        return { success: false, error: "Failed to save directory configuration" };
    }
}

export async function getScannedDirectories() {
    try {
        const dirs = getDirs();
        return { success: true, directories: dirs };
    } catch (error) {
        console.error("Error getting directories:", error);
        return { success: false, directories: [] };
    }
}

export async function getGalleryData() {
    try {
        const dirs = getDirs();
        let allPhotos: Partial<PhotoMetadata>[] = [];

        for (const dir of dirs) {
            const csvPath = path.join(dir, 'photos.csv');
            if (fs.existsSync(csvPath)) {
                const result = await loadCsv(csvPath);
                if (result.success && result.data) {
                    allPhotos = [...allPhotos, ...result.data];
                }
            }
        }

        // Sort by newest first (if date metadata exists) or just reverse
        return { success: true, photos: allPhotos.reverse() };
    } catch (error) {
        console.error("Error fetching gallery data:", error);
        return { success: false, error: "Failed to fetch gallery data" };
    }
}
