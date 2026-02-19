import Papa from 'papaparse';
import { PhotoMetadata } from '@/types';

export const parseCSV = (csvString: string): Promise<PhotoMetadata[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse<PhotoMetadata>(csvString, {
            header: true,
            delimiter: ';',
            skipEmptyLines: true,
            complete: (results) => {
                // Transform tags from string to array if necessary
                const data = results.data.map((row: unknown) => {
                    const r = row as Record<string, string>;
                    return {
                        ...r,
                        tags: r.tags ? r.tags.split(',').map((t: string) => t.trim()) : [],
                        has_text: r.has_text === 'yes',
                        width: parseInt(r.width) || 0,
                        height: parseInt(r.height) || 0,
                        file_size_kb: parseInt(r.file_size_kb) || 0,
                    };
                }) as PhotoMetadata[];
                resolve(data);
            },
            error: (error: Error) => reject(error),
        });
    });
};

export const generateCSV = (data: Partial<PhotoMetadata>[]): string => {
    // Transform arrays back to strings for CSV
    const csvData = data.map(row => ({
        ...row,
        tags: row.tags ? row.tags.join(', ') : '',
        has_text: row.has_text ? 'yes' : 'no'
    }));

    return Papa.unparse(csvData, {
        delimiter: ';',
        header: true,
    });
};
