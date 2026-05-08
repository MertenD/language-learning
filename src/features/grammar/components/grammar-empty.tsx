"use client"

import { useState } from "react"
import { PenLineIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GrammarCreateDialog } from "@/features/grammar/components/grammar-create-dialog"
import { useCreateGrammar } from "@/features/grammar/hooks/use-grammar"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"
import type { CreateGrammarInput } from "@/features/grammar/schema/grammar-crud-schema"

export default function GrammarEmpty() {
    const createGrammar = useCreateGrammar()
    const { handleError, modal } = useUpgradeModal()
    const [isOpen, setIsOpen] = useState(false)

    const handleCreate = (newGrammar: CreateGrammarInput) => {
        createGrammar.mutate(newGrammar, {
            onSuccess: () => setIsOpen(false),
            onError: handleError,
        })
    }

    return (
        <>
            {modal}
            <div className="flex flex-col items-center text-center py-10">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                    <PenLineIcon className="size-7 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">No grammar notes yet</h3>
                <p className="mt-1.5 text-sm text-muted-foreground max-w-[240px]">
                    Save grammar rules as you learn them — the AI uses them when you practice.
                </p>
                <Button className="mt-5" onClick={() => setIsOpen(true)}>
                    Add Grammar Note
                </Button>
            </div>
            <GrammarCreateDialog open={isOpen} onOpenChange={setIsOpen} onCreate={handleCreate} />
        </>
    )
}
