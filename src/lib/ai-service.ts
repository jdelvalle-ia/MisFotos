import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY;

export async function analyzeImage(imageBase64: string, mimeType: string) {
    if (!API_KEY) {
        throw new Error("GOOGLE_API_KEY is not set.");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this image and return a semicolon-separated string with the following details in Spanish:
  scene_type;setting;lighting;color_palette;style;mood;has_text(yes/no);text_content(or empty);main_subject;action;tags(5-10 comma-separated)
  
  Example format:
  landscape;exterior;golden hour;warm;cinematic;peaceful;no;;beach;waves crashing;beach, sunset, ocean, sand, vacation`;

    const image = {
        inlineData: {
            data: imageBase64,
            mimeType: mimeType,
        },
    };

    try {
        const result = await model.generateContent([prompt, image]);
        const response = await result.response;
        const text = response.text();
        return text.trim();
    } catch (error) {
        console.error("Error analyzing image with Gemini:", error);
        throw error;
    }
}
