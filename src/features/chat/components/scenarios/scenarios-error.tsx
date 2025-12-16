export default function ScenariosError() {
    return <div className="flex items-center justify-center h-64">
        <div className="text-center">
            <p className="text-red-500 font-semibold">Fehler beim Laden der Szenarien</p>
            <p className="text-sm text-muted-foreground mt-2">Bitte versuche es später erneut.</p>
        </div>
    </div>
}

