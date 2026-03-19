import { PhotoMetadata } from "@/types";

// This function will upload the file to a server route that handles the Gemini API call
export async function analyzeImageClient(file: File): Promise<Partial<PhotoMetadata>> {
    // Check if we are in Electron environment with our API exposed
    if (typeof window !== 'undefined' && window.electronAPI) {
        const filePath = (file as any).path;

        if (filePath) {
            try {
                console.log(`[CLIENT-AI] Electron detected. Analyzing path: ${filePath}`);
                const response = await window.electronAPI.analyzeImage(filePath);
                if (response.success && response.data) {
                    return response.data;
                } else {
                    console.error("[CLIENT-AI] Electron analysis error:", response.error);
                    throw new Error(response.error || "Error en el servicio de IA");
                }
            } catch (error: any) {
                console.error("[CLIENT-AI] Error calling Electron service:", error);
                throw error;
            }
        } else {
            console.warn("[CLIENT-AI] Electron detected but file.path is missing (likely after compression)");
        }
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        // Simulated response for static export testing
        return {
            filename: file.name,
            description: "Simulated description (Web fallback). Gemini processing requires Electron Desktop application.",
            tags: ["web-fallback", "no-path"]
        };
    } catch (error: unknown) {
        console.error("AI Analysis error:", error);
        throw error;
    }
}
