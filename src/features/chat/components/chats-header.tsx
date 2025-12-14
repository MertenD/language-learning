"use client"

import { EntityHeader } from "@/components/entity-components";
import {useCreateWord} from "@/features/words/hooks/use-words";
import {useUpgradeModal} from "@/hooks/use-upgrade-modal";
import {WordCreateDialog} from "@/features/words/components/word-create-dialog";
import {useState} from "react";
import {CreateWordInput} from "@/features/words/schema/word-crud-schema";

type ChatsHeaderProps = {
    disabled?: boolean
}

export default function ChatsHeader({ disabled }: ChatsHeaderProps) {

    return <EntityHeader
        title="Chats"
        description="Visit your old chats or start a new conversation"
        disabled={disabled}
    />
}