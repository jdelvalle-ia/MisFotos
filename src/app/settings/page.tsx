import { ConnectionStatusWidget } from "@/components/settings/ConnectionStatusWidget";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <ConnectionStatusWidget />



            </div>
        </div>
    );
}
