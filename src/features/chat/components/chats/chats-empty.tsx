"use client"

import {EmptyView} from "@/components/entity-components";
import {toast} from "sonner";
import {useCreateEmptyChat} from "@/features/chat/hooks/use-chat";
import {useRouter} from "next/navigation";
import {useUpgradeModal} from "@/hooks/use-upgrade-modal";

export default function ChatsEmpty() {
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
        <EmptyView
            onNew={handleNewChat}
            message="No chats found. Get started by starting a new chat."
        />
    </>
}