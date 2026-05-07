"use client"

import {Word, WordProgress} from "@/generated/prisma/client";
import React, {useState} from "react";
import {VocabularyEntityItem} from "@/components/entity-components";
import {WordEditDialog} from "@/features/words/components/word-edit-dialog";
import {useRemoveWord, useUpdateWord} from "@/features/words/hooks/use-words";
import {useLanguage, useNativeLanguage} from "@/features/user/hooks/use-language";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {cn} from "@/lib/utils";

type WordWithProgress = Word & { progress?: WordProgress | null }

const LEVEL_LABELS = ["New", "Learning", "Learning", "Advanced", "Advanced", "Mastered"]

const LEVEL_CHIP_CLASSES = [
    "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
]

const LEVEL_BORDER_CLASSES = [
    "border-l-[3px] border-l-gray-300 dark:border-l-gray-600",
    "border-l-[3px] border-l-amber-400",
    "border-l-[3px] border-l-amber-500",
    "border-l-[3px] border-l-blue-400",
    "border-l-[3px] border-l-blue-500",
    "border-l-[3px] border-l-green-500",
]

function LevelChip({ level }: { level: number }) {
    return (
        <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap",
            LEVEL_CHIP_CLASSES[level] ?? LEVEL_CHIP_CLASSES[0]
        )}>
            {LEVEL_LABELS[level] ?? "Unknown"}
        </span>
    )
}

export default function WordItem({ data }: { data: WordWithProgress }) {
    const removeWord = useRemoveWord()
    const updateWord = useUpdateWord()
    const [isOpen, setIsOpen] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const { currentLanguage } = useLanguage()
    const { data: nativeLanguage } = useNativeLanguage()

    const handleSave = async (updatedWord: Word) => {
        updateWord.mutate({
            id: updatedWord.id,
            primary: updatedWord.primary,
            primaryInfo: updatedWord.primaryInfo || undefined,
            secondary: updatedWord.secondary,
            secondaryInfo: updatedWord.secondaryInfo || undefined,
            categoryId: updatedWord.categoryId || undefined,
            examples: updatedWord.examples ?? []
        })
    }

    const handleRemove = () => {
        setIsConfirmOpen(true)
    }

    const confirmRemove = () => {
        removeWord.mutate({ id: data.id })
    }

    const level = data.progress?.level
    const hasProgress = level != null

    return <>
        <VocabularyEntityItem
            primaryLanguage={data.primary}
            primaryInfo={data.primaryInfo}
            secondaryLanguage={data.secondary}
            secondaryInfo={data.secondaryInfo}
            primaryFlag={<span className="text-2xl">{nativeLanguage?.flagEmoji}</span>}
            secondaryFlag={<span className="text-2xl">{currentLanguage?.flagEmoji}</span>}
            actions={hasProgress ? <LevelChip level={level} /> : undefined}
            className={hasProgress ? LEVEL_BORDER_CLASSES[level] : undefined}
            onRemove={handleRemove}
            isRemoving={removeWord.isPending}
            onClick={() => setIsOpen(true)}
        />
        <WordEditDialog word={data} open={isOpen} onOpenChange={setIsOpen} onSave={handleSave} />

        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete vocabulary?</AlertDialogTitle>
                    <AlertDialogDescription>
                        "{data.primary}" will be permanently deleted.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
}
