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
