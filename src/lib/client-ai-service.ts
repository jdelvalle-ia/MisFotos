import { PhotoMetadata } from "@/types";

// This function will upload the file to a server route that handles the Gemini API call
export async function analyzeImageClient(file: File): Promise<Partial<PhotoMetadata>> {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("/api/analyze", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            let errorMessage = `Analysis failed: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage = errorData.error;
                }
            } catch {
                // Ignore JSON parse error if response is not JSON
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data; // unique metadata from AI
    } catch (error: unknown) {
        console.error("AI Analysis error:", error);
        throw error;
    }
}
