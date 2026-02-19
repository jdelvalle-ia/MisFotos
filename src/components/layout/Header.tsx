import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
    title?: string;
}

export function Header({ title }: HeaderProps) {
    return (
        <header className="h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20 flex items-center justify-between px-6 md:ml-64">
            <h1 className="text-xl font-semibold">{title || "MisFotos"}</h1>
            <div className="flex items-center gap-4">
                {/* Theme Toggle moved to Sidebar */}
            </div>
        </header>
    );
}
