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
import {createChatSystemMessage} from "@/features/chat/utils/prompts";

type ChatsHeaderProps = {
    disabled?: boolean
}

export default function ChatsHeader({ disabled }: ChatsHeaderProps) {

    const createEmptyChat = useCreateEmptyChat()
    const router = useRouter()
    const { handleError, modal } = useUpgradeModal()

    const handleNewChat = async () => {
        createEmptyChat.mutate({
            title: "New Chat",
            systemMessage: createChatSystemMessage()
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