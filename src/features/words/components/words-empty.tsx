import {EmptyView} from "@/components/entity-components";
import {useCreateWord} from "@/features/words/hooks/use-words";
import {useUpgradeModal} from "@/hooks/use-upgrade-modal";
import {useState} from "react";
import {CreateWordInput} from "@/features/words/schema/word-crud-schema";
import {WordCreateDialog} from "@/features/words/components/word-create-dialog";
import {useWordsParams} from "@/features/words/hooks/use-words-params";

export default function WordsEmpty() {
    const createWord = useCreateWord()
    const { handleError, modal } = useUpgradeModal()
    const [isOpen, setIsOpen] = useState(false)
    const [params, _] = useWordsParams()

    const handleCreate = (newWord: CreateWordInput) => {
        createWord.mutate(newWord, {
            onError: (error) => {
                handleError(error)
            }
        })
    }

    return <>
        {modal}
        <EmptyView
            onNew={() => setIsOpen(true)}
            message="No words found. Get started by adding a word!"
        />
        <WordCreateDialog open={isOpen} onOpenChange={setIsOpen} onCreate={handleCreate} categoryId={params.categoryId} />
    </>
}