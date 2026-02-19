import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export async function compressImage(file: File, maxDimension = 1600, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxDimension) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                }
            } else {
                if (height > maxDimension) {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const newFile = new File([blob], file.name, {
                            type: "image/jpeg",
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    } else {
                        reject(new Error("Canvas to Blob failed"));
                    }
                },
                "image/jpeg",
                quality
            );
        };
        img.onerror = (error) => reject(error);
    });
}
