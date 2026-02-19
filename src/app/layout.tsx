import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components/layout/MainLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MisFotos - Gestión de Galerías Multimedia",
  description: "Aplicación para gestión inteligente de fotos con IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
