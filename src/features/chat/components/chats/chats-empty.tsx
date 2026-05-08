"use client"

import { MessageSquareTextIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCreateEmptyChat } from "@/features/chat/hooks/use-chat"
import { useRouter } from "next/navigation"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"
import { createChatSystemMessage } from "@/features/chat/utils/prompts"

export default function ChatsEmpty() {
    const createEmptyChat = useCreateEmptyChat()
    const router = useRouter()
    const { handleError, modal } = useUpgradeModal()

    const handleNewChat = () => {
        createEmptyChat.mutate(
            { title: "New Chat", systemMessage: createChatSystemMessage() },
            {
                onSuccess: (chatId) => router.push(`/chat/${chatId}`),
                onError: handleError,
            }
        )
    }

    return (
        <>
            {modal}
            <div className="flex flex-col items-center text-center py-10">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                    <MessageSquareTextIcon className="size-7 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">No conversations yet</h3>
                <p className="mt-1.5 text-sm text-muted-foreground max-w-[240px]">
                    Start a conversation to practice speaking and writing in your target language.
                </p>
                <Button className="mt-5" onClick={handleNewChat} disabled={createEmptyChat.isPending}>
                    Start Conversation
                </Button>
            </div>
        </>
    )
}
