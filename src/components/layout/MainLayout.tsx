"use client";

// import { usePathname } from "next/navigation";
// import { Header } from "./Header"; // Removed
import { Sidebar } from "./Sidebar";
import { ConsoleProvider } from "@/context/ConsoleContext";

interface MainLayoutProps {
    children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    //     const pathname = usePathname();
    //     const title =
    //         pathname === "/" ? "Dashboard" :
    //             pathname === "/gallery" ? "Galería" :
    //                 pathname === "/settings" ? "Configuración" : "MisFotos";

    return (
        <ConsoleProvider>
            <div className="min-h-screen bg-background text-foreground flex">
                <Sidebar />
                <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                    {/* Header removed for more space */}
                    <main className="flex-1 p-6 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </ConsoleProvider>
    );
}
