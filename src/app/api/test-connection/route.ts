import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 10; // Fast timeout for test

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function GET() {
    if (!apiKey) {
        return NextResponse.json({
            success: false,
            message: "API Key no configurada en .env"
        }, { status: 500 });
    }

    try {
        if (!genAI) throw new Error("Cliente Gemini no inicializado");

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Ping");
        const response = await result.response;
        const text = response.text();

        if (text) {
            return NextResponse.json({ success: true, message: "Conectado correctamente" });
        } else {
            throw new Error("Respuesta vacía del modelo");
        }

    } catch (error: any) {
        console.error("Connection Test Error:", error);
        return NextResponse.json({
            success: false,
            message: error.message || "Error de conexión con Google API"
        }, { status: 500 });
    }
}
