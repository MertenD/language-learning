"use client"

import {Word} from "@/generated/prisma/client";
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

export default function WordItem({ data }: { data: Word }) {
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

    return <>
        <VocabularyEntityItem
            primaryLanguage={data.primary}
            primaryInfo={data.primaryInfo}
            secondaryLanguage={data.secondary}
            secondaryInfo={data.secondaryInfo}
            primaryFlag={<span className="text-2xl">{nativeLanguage?.flagEmoji}</span>}
            secondaryFlag={<span className="text-2xl">{currentLanguage?.flagEmoji}</span>}
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
