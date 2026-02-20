import { ConnectionStatusWidget } from "@/components/settings/ConnectionStatusWidget";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 drop-shadow-sm pb-1">Configuración</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <ConnectionStatusWidget />



            </div>
        </div>
    );
}
