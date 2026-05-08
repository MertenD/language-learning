"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { ScenarioEditorDialog } from "@/features/chat/components/scenarios/scenario-editor-dialog"

type ScenariosHeaderProps = {
    disabled?: boolean
}

export default function ScenariosHeader({ disabled }: ScenariosHeaderProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <ScenarioEditorDialog open={isOpen} onOpenChange={setIsOpen} />
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Scenarios</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        Practice real conversations — AI-tailored to your vocabulary
                    </p>
                </div>
                <Button onClick={() => setIsOpen(true)} disabled={disabled}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create
                </Button>
            </div>
        </>
    )
}
