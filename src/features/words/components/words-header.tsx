"use client"

import {useUpgradeModal} from "@/hooks/use-upgrade-modal";
import {WordCreateDialog} from "@/features/words/components/word-create-dialog";
import {useState} from "react";
import {CreateWordInput} from "@/features/words/schema/word-crud-schema";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {CategoryCreateDialog} from "@/features/words/components/categories/category-create-dialog";
import {useWordsParams} from "@/features/words/hooks/use-words-params";
import {useCreateWord} from "@/features/words/hooks/use-words";
import {useCreateCategory} from "@/features/words/hooks/use-categories";

type WordsHeaderProps = {
    disabled?: boolean
}

export default function WordsHeader({ disabled }: WordsHeaderProps) {
    const createWord = useCreateWord()
    const createCategory = useCreateCategory()
    const { handleError, modal } = useUpgradeModal()
    const [isWordOpen, setIsWordOpen] = useState(false)
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const [params] = useWordsParams()

    const handleCreateWord = (newWord: CreateWordInput) => {
        createWord.mutate(newWord, {
            onSuccess: () => {
                setIsWordOpen(false)
            },
            onError: (error) => {
                handleError(error)
            }
        })
    }

    const handleCreateCategory = (name: string) => {
        createCategory.mutate({
            name,
            parentId: params.categoryId === "" ? undefined : params.categoryId
        }, {
            onSuccess: () => {
                setIsCategoryOpen(false)
            },
            onError: (error) => {
                handleError(error)
            }
        })
    }

    return <>
        {modal}
        <div className="flex items-center justify-between mb-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Vocabulary</h1>
                <p className="text-muted-foreground">Create and manage your vocabulary</p>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => setIsCategoryOpen(true)} variant="outline" disabled={disabled}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Folder
                </Button>
                <Button onClick={() => setIsWordOpen(true)} disabled={disabled}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Vocabulary
                </Button>
            </div>
        </div>
        <WordCreateDialog open={isWordOpen} onOpenChange={setIsWordOpen} onCreate={handleCreateWord} categoryId={params.categoryId} />
        <CategoryCreateDialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen} onCreate={handleCreateCategory} />
    </>
}