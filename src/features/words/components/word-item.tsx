"use client"

import {Word} from "@/generated/prisma/client";
import React, {useState} from "react";
import {VocabularyEntityItem} from "@/components/entity-components";
import {WordEditDialog} from "@/features/words/components/word-edit-dialog";
import {useRemoveWord, useUpdateWord} from "@/features/words/hooks/use-words";

export default function WordItem({ data }: { data: Word }) {
    const removeWord = useRemoveWord()
    const updateWord = useUpdateWord()
    const [isOpen, setIsOpen] = useState(false)

    const handleSave = async (updatedWord: Word) => {
        updateWord.mutate({
            id: updatedWord.id,
            german: updatedWord.german,
            germanInfo: updatedWord.germanInfo || undefined,
            serbian: updatedWord.serbian,
            serbianInfo: updatedWord.serbianInfo || undefined
        })
    }

    const handleRemove = () => {
        removeWord.mutate({ id: data.id })
    }

    return <>
        <VocabularyEntityItem
            primaryLanguage={data.german}
            primaryInfo={data.germanInfo}
            secondaryLanguage={data.serbian}
            secondaryInfo={data.serbianInfo}
            primaryFlag={<span className="text-2xl">🇩🇪</span>}
            secondaryFlag={<span className="text-2xl">🇷🇸</span>}
            onRemove={handleRemove}
            isRemoving={removeWord.isPending}
            onClick={() => setIsOpen(true)}
        />
        <WordEditDialog word={data} open={isOpen} onOpenChange={setIsOpen} onSave={handleSave} />
    </>
}