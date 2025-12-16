"use client"

import { EntityHeader } from "@/components/entity-components";

type ScenariosHeaderProps = {
    disabled?: boolean
}

export default function ScenariosHeader({ disabled }: ScenariosHeaderProps) {
    return <EntityHeader
        title="Szenarien"
        description="Wähle ein Szenario aus, um in einem spezifischen Kontext Serbisch zu üben"
        disabled={disabled}
    />
}

