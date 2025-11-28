"use client"

import { EntityHeader } from "@/components/entity-components";
import {useCreateWord} from "@/features/words/hooks/use-words";
import {useUpgradeModal} from "@/hooks/use-upgrade-modal";

type WordsHeaderProps = {
    disabled?: boolean
}

export default function WordsHeader({ disabled }: WordsHeaderProps) {
    const createWord = useCreateWord()
    const { handleError, modal } = useUpgradeModal()

    const handleCreate = () => {
        createWord.mutate({
            german: "Brot",
            serbian: "Hleb"
        }, {
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
            onNew={handleCreate}
            newButtonLabel="New vocabulary"
            disabled={disabled}
            isCreating={createWord.isPending}
        />
    </>
}