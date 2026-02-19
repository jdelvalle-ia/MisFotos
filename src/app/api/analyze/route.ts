import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const maxDuration = 60; // Allow up to 60 seconds for AI processing


export async function POST(req: NextRequest) {
    if (!genAI) {
        return NextResponse.json({ error: "Google API Key not configured" }, { status: 500 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Image = buffer.toString("base64");

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Analiza la imagen y devuelve un objeto JSON con la siguiente estructura.
        Si algún dato no está claro, estima o usa "Desconocido".
        NO respondas con texto plano, SOLO JSON.

        {
          "format": "jpg/png/etc",
          "width": numerico,
          "height": numerico,
          "resolution": "SD/HD/FHD/2K/4K",
          "aspect_ratio": "16:9/4:3/1:1/etc",
          "orientation": "horizontal/vertical/cuadrada",
          "file_size_kb": numerico_estimado,
          "date_taken": "YYYY-MM-DD HH:mm:ss" o null,
          "description": "breve descripción visual",
          "scene_type": "interior/exterior/etc",
          "setting": "urbano/naturaleza/etc",
          "lighting": "natural/artificial/etc",
          "color_palette": "vibrante/neutra/etc",
          "style": "fotorrealista/etc",
          "mood": "estado de animo",
          "has_text": boolean,
          "text_content": "texto detectado o null",
          "main_subject": "sujeto principal",
          "action": "accion o 'ninguna'",
          "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
        }`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: file.type || "image/jpeg"
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();
        console.log("Gemini Raw Response:", text); // Debug logging

        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        return NextResponse.json(data);

    } catch (error) {
        console.error("Analysis API Error:", error);
        return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
    }
}
