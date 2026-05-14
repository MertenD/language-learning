import { CompassIcon } from "lucide-react"

export default function ScenariosEmpty() {
    return (
        <div className="flex flex-col items-center justify-center text-center rounded-xl border border-dashed py-12 px-4">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted">
                <CompassIcon className="size-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">No scenarios available</h3>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
                There are no scenarios for this language yet. Create your own above to get started.
            </p>
        </div>
    )
}
