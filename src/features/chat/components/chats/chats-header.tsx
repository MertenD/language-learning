"use client"

import { EntityHeader } from "@/components/entity-components";
import {useCreateWord} from "@/features/words/hooks/use-words";
import {useUpgradeModal} from "@/hooks/use-upgrade-modal";
import {WordCreateDialog} from "@/features/words/components/word-create-dialog";
import {useState} from "react";
import {CreateWordInput} from "@/features/words/schema/word-crud-schema";
import {useCreateEmptyChat} from "@/features/chat/hooks/use-chat";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

type ChatsHeaderProps = {
    disabled?: boolean
}

export default function ChatsHeader({ disabled }: ChatsHeaderProps) {

    const createEmptyChat = useCreateEmptyChat()
    const router = useRouter()
    const { handleError, modal } = useUpgradeModal()

    const handleNewChat = async () => {
        createEmptyChat.mutate({
            // TODO Make this customizable or use centralized default
            title: "New Chat",
            systemMessage: "Help the user learn serbian"
        }, {
            onSuccess: (chatId) => {
                router.push(`/chat/${chatId}`)
            },
            onError: (error) => {
                handleError(error)
            }
        })
    }

    return <>
        {modal}
        <EntityHeader
            title="Chats"
            description="Visit your old chats or start a new conversation"
            onNew={handleNewChat}
            newButtonLabel="New Chat"
            isCreating={createEmptyChat.isPending}
            disabled={disabled}
        />
    </>
}