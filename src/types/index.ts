export interface PhotoMetadata {
    filename: string;
    path: string;
    format: string;
    width: number;
    height: number;
    resolution: string;
    aspect_ratio: string;
    orientation: 'horizontal' | 'vertical' | 'square';
    file_size_kb: number;
    description: string;
    scene_type: string;
    setting: string;
    lighting: string;
    color_palette: string;
    style: string;
    mood: string;
    has_text: boolean;
    text_content: string;
    main_subject: string;
    action: string;
    tags: string[];
    date_added?: string;
    date_taken?: string;
    realPath?: string;
}

export interface CsvSettings {
    filepath: string;
    delimiter: string;
}

export type Theme = 'dark' | 'light' | 'system';

export interface ScanResult {
    success?: boolean;
    count?: number;
    error?: string;
    images?: Partial<PhotoMetadata>[];
}

declare global {
    interface Window {
        electronAPI?: {
            ping: () => Promise<string>;
            selectDirectory: () => Promise<string | null>;
            readImage: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
            getSettings: () => Promise<any>;
            saveSettings: (settings: any) => Promise<boolean>;
            getScannedDirectories: () => Promise<{ success: boolean; directories: string[] }>;
            saveScannedDirectory: (dirPath: string) => Promise<{ success: boolean; error?: string }>;
            scanDirectory: (dirPath: string) => Promise<ScanResult>;
            saveCsv: (filePath: string, data: Partial<PhotoMetadata>[]) => Promise<{ success: boolean; error?: string }>;
            loadCsv: (filePath: string) => Promise<{ success: boolean; data?: Partial<PhotoMetadata>[]; error?: string }>;
            analyzeImage: (filePath: string, prompt?: string) => Promise<{ success: boolean; data?: Partial<PhotoMetadata>; error?: string }>;
        };
    }
}
