import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mime from 'mime'; // We might need to install this package

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('path');

    if (!filePath) {
        return new NextResponse("Missing path parameter", { status: 400 });
    }

    // Decode URL component just in case, though searchParams usually handles it
    const decodedPath = decodeURIComponent(filePath);

    // Basic security check: ensure file exists
    if (!fs.existsSync(decodedPath)) {
        return new NextResponse("File not found", { status: 404 });
    }

    // Determine mime type
    // If 'mime' package is not available, we can do a basic check
    const ext = path.extname(decodedPath).toLowerCase();
    let contentType = 'application/octet-stream';

    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';

    try {
        const fileBuffer = fs.readFileSync(decodedPath);
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error("Error reading file:", error);
        return new NextResponse("Error reading file", { status: 500 });
    }
}
