import { PhotoMetadata } from "@/types";

export function parseAIResponse(rawResponse: string): Partial<PhotoMetadata> {
    // Expected format:
    // scene_type;setting;lighting;color_palette;style;mood;has_text;text_content;main_subject;action;tags

    if (!rawResponse) return {};

    const parts = rawResponse.split(';').map(p => p.trim());

    // Basic validation to ensure we have enough parts, though Gemini might return fewer/more.
    // We'll map safely.

    return {
        scene_type: parts[0] || "",
        setting: parts[1] || "",
        lighting: parts[2] || "",
        color_palette: parts[3] || "",
        style: parts[4] || "",
        mood: parts[5] || "",
        has_text: parts[6]?.toLowerCase() === 'yes' || parts[6]?.toLowerCase() === 'si',
        text_content: parts[7] || "",
        main_subject: parts[8] || "",
        action: parts[9] || "",
        tags: parts[10] ? parts[10].split(',').map(t => t.trim()) : [],
    };
}
