import fs from 'fs';

const CONFIG_FILE = 'config.json';

export interface AppConfig {
    scannedDirectories: string[];
}

const DEFAULT_CONFIG: AppConfig = {
    scannedDirectories: [],
};

export function getConfig(): AppConfig {
    try {
        if (!fs.existsSync(CONFIG_FILE)) {
            return DEFAULT_CONFIG;
        }
        const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading config:", error);
        return DEFAULT_CONFIG;
    }
}

export function saveConfig(config: AppConfig) {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error saving config:", error);
    }
}

export function addScannedDirectory(dirPath: string) {
    const config = getConfig();
    if (!config.scannedDirectories.includes(dirPath)) {
        config.scannedDirectories.push(dirPath);
        saveConfig(config);
    }
}

export function getScannedDirectories() {
    return getConfig().scannedDirectories;
}
