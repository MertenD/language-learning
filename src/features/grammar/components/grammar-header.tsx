"use client"

import {EntityHeader} from "@/components/entity-components";
import {useUpgradeModal} from "@/hooks/use-upgrade-modal";
import {useState} from "react";
import {CreateGrammarInput} from "@/features/grammar/schema/grammar-crud-schema";
import {useCreateGrammar} from "@/features/grammar/hooks/use-grammar";
import {GrammarCreateDialog} from "@/features/grammar/components/grammar-create-dialog";

type GrammarHeaderProps = {
    disabled?: boolean
}

export default function GrammarHeader({ disabled }: GrammarHeaderProps) {
    const createGrammar = useCreateGrammar()
    const { handleError, modal } = useUpgradeModal()
    const [isOpen, setIsOpen] = useState(false)

    const handleCreate = (newGrammar: CreateGrammarInput) => {
        createGrammar.mutate(newGrammar, {
            onSuccess: () => {
                setIsOpen(false)
            },
            onError: (error) => {
                handleError(error)
            }
        })
    }

    return <>
        {modal}
        <EntityHeader
            title="Grammar"
            description="Create and managae your grammar"
            onNew={() => setIsOpen(true)}
            newButtonLabel="New Grammar"
            disabled={disabled}
            isCreating={createGrammar.isPending}
        />
        <GrammarCreateDialog open={isOpen} onOpenChange={setIsOpen} onCreate={handleCreate} />
    </>
}