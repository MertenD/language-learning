"use client"

import {EmptyView} from "@/components/entity-components";
import {useCreateEmptyChat} from "@/features/chat/hooks/use-chat";
import {useRouter} from "next/navigation";
import {useUpgradeModal} from "@/hooks/use-upgrade-modal";
import {createChatSystemMessage} from "@/config/prompts";

export default function ChatsEmpty() {
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
        <EmptyView
            onNew={handleNewChat}
            message="No chats found. Get started by starting a new chat."
        />
    </>
}