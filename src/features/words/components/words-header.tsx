"use client"

import { EntityHeader } from "@/components/entity-components";
import {useCreateWord} from "@/features/words/hooks/use-words";
import {useUpgradeModal} from "@/hooks/use-upgrade-modal";
import {WordCreateDialog} from "@/features/words/components/word-create-dialog";
import {useState} from "react";
import {CreateWordInput} from "@/features/words/schema/word-crud-schema";

type WordsHeaderProps = {
    disabled?: boolean
}

export default function WordsHeader({ disabled }: WordsHeaderProps) {
    const createWord = useCreateWord()
    const { handleError, modal } = useUpgradeModal()
    const [isOpen, setIsOpen] = useState(false)

    const handleCreate = (newWord: CreateWordInput) => {
        createWord.mutate(newWord, {
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
            title="Vocabulary"
            description="Create and managae your vocabulary"
            onNew={() => setIsOpen(true)}
            newButtonLabel="New vocabulary"
            disabled={disabled}
            isCreating={createWord.isPending}
        />
        <WordCreateDialog open={isOpen} onOpenChange={setIsOpen} onCreate={handleCreate} />
    </>
}