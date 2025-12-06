"use client"

import {Grammar} from "@/generated/prisma/client";
import React, {useState} from "react";
import {MarkdownEntityItem} from "@/components/entity-components";
import {useRemoveGrammar, useUpdateGrammar} from "@/features/grammar/hooks/use-grammar";
import {GrammarEditDialog} from "@/features/grammar/components/grammar-edit-dialog";

export default function GrammarItem({ data }: { data: Grammar }) {
    const removeGrammar = useRemoveGrammar()
    const updateGrammar = useUpdateGrammar()
    const [isOpen, setIsOpen] = useState(false)

    const handleSave = async (updatedGrammar: Grammar) => {
        updateGrammar.mutate({
            id: updatedGrammar.id,
            title: updatedGrammar.title,
            content: updatedGrammar.content
        })
    }

    const handleRemove = () => {
        removeGrammar.mutate({ id: data.id })
    }

    return <>
        <MarkdownEntityItem
            title={data.title}
            content={data.content}
            onRemove={handleRemove}
            isRemoving={removeGrammar.isPending}
            onClick={() => setIsOpen(true)}
        />
        <GrammarEditDialog grammar={data} open={isOpen} onOpenChange={setIsOpen} onSave={handleSave} />
    </>
}