"use client"

import {Word, WordProgress} from "@/generated/prisma/client";
import React, {useState} from "react";
import {VocabularyEntityItem} from "@/components/entity-components";
import {WORD_TYPE_COLORS, WORD_TYPE_LABELS, WordType} from "@/features/words/schema/word-crud-schema";
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
import {useTranslations} from "next-intl";

type WordWithProgress = Word & { progress?: WordProgress | null }

export const LEVEL_CHIP_CLASSES = [
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

function WordTypeBadge({ type }: { type: string }) {
    const wt = type as WordType
    return (
        <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap",
            WORD_TYPE_COLORS[wt] ?? WORD_TYPE_COLORS.other
        )}>
            {WORD_TYPE_LABELS[wt] ?? type}
        </span>
    )
}

export function LevelChip({ level }: { level: number }) {
    const t = useTranslations('words.levels');
    const key = String(level) as Parameters<typeof t>[0];
    const label = ['0','1','2','3','4','5'].includes(String(level)) ? t(key) : t('unknown');
    return (
        <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap",
            LEVEL_CHIP_CLASSES[level] ?? LEVEL_CHIP_CLASSES[0]
        )}>
            {label}
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
    const t = useTranslations('words.wordItem');

    const handleSave = async (updatedWord: Word) => {
        updateWord.mutate({
            id: updatedWord.id,
            primary: updatedWord.primary,
            primaryInfo: updatedWord.primaryInfo || undefined,
            secondary: updatedWord.secondary,
            secondaryInfo: updatedWord.secondaryInfo || undefined,
            categoryId: updatedWord.categoryId || undefined,
            examples: updatedWord.examples ?? [],
            wordType: (updatedWord.wordType as WordType) || null,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            forms: (updatedWord.forms as any) || null,
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
            actions={
                <div className="flex items-center gap-1.5">
                    {data.wordType && <WordTypeBadge type={data.wordType} />}
                    {hasProgress && <LevelChip level={level} />}
                </div>
            }
            className={hasProgress ? LEVEL_BORDER_CLASSES[level] : undefined}
            onRemove={handleRemove}
            isRemoving={removeWord.isPending}
            onClick={() => setIsOpen(true)}
        />
        <WordEditDialog word={data} open={isOpen} onOpenChange={setIsOpen} onSave={handleSave} />

        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('deleteDescription', { word: data.primary })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {t('confirm')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
}
