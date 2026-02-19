import Papa from "papaparse";
import { PhotoMetadata } from "@/types";

export function parseCSV(csvContent: string): Promise<Partial<PhotoMetadata>[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                console.log("CSV Parsed Results:", results);
                if (results.errors.length > 0) {
                    console.warn("CSV Parse errors:", results.errors);
                }

                // Map and clean data
                const photos = results.data
                    .filter((row: any) => row.filename) // Filter out empty lines that might have slipped through
                    .map((row: any) => ({
                        ...row,
                        file_size_kb: row.file_size_kb ? Number(row.file_size_kb) : undefined,
                        has_text: row.has_text === 'true' || row.has_text === true, // Handle boolean conversion
                        tags: row.tags ? row.tags.split('|') : [],
                        people_count: row.people_count ? Number(row.people_count) : undefined,
                        path: row.path // Important: Path might be absolute from old CSV or just filename
                    }));

                console.log("Mapped Photos:", photos);
                resolve(photos);
            },
            error: (error: any) => {
                console.error("CSV Parse Error:", error);
                reject(error);
            }
        });
    });
}

export function generateCSV(data: Partial<PhotoMetadata>[]): string {
    const csvData = data.map(photo => {
        // Ensure all fields are present for consistent CSV structure
        return {
            date_added: photo.date_added || new Date().toISOString(),
            date_taken: photo.date_taken || '', // New field
            filename: photo.filename || '',
            path: photo.path || '',
            format: photo.format || '',
            width: photo.width || '',
            height: photo.height || '',
            resolution: photo.resolution || '',
            aspect_ratio: photo.aspect_ratio || '',
            orientation: photo.orientation || '',
            file_size_kb: photo.file_size_kb || '',
            description: photo.description || '',
            scene_type: photo.scene_type || '',
            setting: photo.setting || '',
            lighting: photo.lighting || '',
            color_palette: photo.color_palette || '',
            style: photo.style || '',
            mood: photo.mood || '',
            has_text: photo.has_text ? 'true' : 'false',
            text_content: photo.text_content || '',
            main_subject: photo.main_subject || '',
            action: photo.action || '',
            tags: photo.tags ? photo.tags.join('|') : ''
        };
    });
    return Papa.unparse(csvData, {
        columns: [
            "date_added", "date_taken", "filename", "path", "format", "width", "height", "resolution", "aspect_ratio",
            "orientation", "file_size_kb", "description", "scene_type", "setting",
            "lighting", "color_palette", "style", "mood", "has_text", "text_content",
            "main_subject", "action", "tags"
        ]
    });
}
