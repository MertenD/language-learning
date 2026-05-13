"use client"

import { useState } from "react"
import { BookOpenIcon, SparklesIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WordCreateDialog } from "@/features/words/components/word-create-dialog"
import { GenerateWordsDialog } from "@/features/words/components/generate-words-dialog"
import { useCreateWord } from "@/features/words/hooks/use-words"
import { useWordsParams } from "@/features/words/hooks/use-words-params"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"
import type { CreateWordInput } from "@/features/words/schema/word-crud-schema"
import {useTranslations} from "next-intl";

export default function WordsEmpty() {
    const createWord = useCreateWord()
    const { handleError, modal } = useUpgradeModal()
    const [params] = useWordsParams()
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isGenerateOpen, setIsGenerateOpen] = useState(false)
    const t = useTranslations('words.empty');

    const isInFolder = !!params.categoryId

    const handleCreate = (newWord: CreateWordInput) => {
        createWord.mutate(newWord, { onError: handleError })
    }

    return (
        <>
            {modal}
            <div className="flex flex-col items-center justify-center text-center py-20 px-4">
                <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-muted">
                    <BookOpenIcon className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">
                    {isInFolder ? t('folderTitle') : t('noVocabTitle')}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                    {isInFolder ? t('folderBody') : t('noVocabBody')}
                </p>
                <div className="mt-6 flex gap-2">
                    <Button variant="outline" onClick={() => setIsGenerateOpen(true)}>
                        <SparklesIcon className="mr-1.5 h-4 w-4" />
                        {t('generateButton')}
                    </Button>
                    <Button onClick={() => setIsAddOpen(true)}>
                        <PlusIcon className="mr-1.5 h-4 w-4" />
                        {t('addButton')}
                    </Button>
                </div>
            </div>
            <WordCreateDialog
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                onCreate={handleCreate}
                categoryId={params.categoryId}
            />
            <GenerateWordsDialog
                open={isGenerateOpen}
                onOpenChange={setIsGenerateOpen}
                categoryId={params.categoryId || null}
            />
        </>
    )
}
