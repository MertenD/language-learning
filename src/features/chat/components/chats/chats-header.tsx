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
import {Button} from "@/components/ui/button";
import {BookPlusIcon} from "lucide-react";

type ChatsHeaderProps = {
    disabled?: boolean
}

export default function ChatsHeader({ disabled }: ChatsHeaderProps) {
    const createEmptyChat = useCreateEmptyChat()
    const createWord = useCreateWord()
    const router = useRouter()
    const { handleError, modal } = useUpgradeModal()
    const [isWordDialogOpen, setIsWordDialogOpen] = useState(false)

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

    const handleCreateWord = (input: CreateWordInput) => {
        createWord.mutate(input, {
            onSuccess: () => {
                setIsWordDialogOpen(false)
            },
            onError: (error) => {
                handleError(error)
            }
        })
    }

    return <>
        {modal}
        <WordCreateDialog
            open={isWordDialogOpen}
            onOpenChange={setIsWordDialogOpen}
            onCreate={handleCreateWord}
        />
        <div className="flex items-start justify-between gap-x-4">
            <EntityHeader
                title="Chats"
                description="Visit your old chats or start a new conversation"
                onNew={handleNewChat}
                newButtonLabel="New Chat"
                isCreating={createEmptyChat.isPending}
                disabled={disabled}
            />
            <Button
                variant="outline"
                size="sm"
                className="shrink-0 mt-1"
                onClick={() => setIsWordDialogOpen(true)}
                disabled={disabled}
            >
                <BookPlusIcon className="size-4 mr-2" />
                Add Word
            </Button>
        </div>
    </>
}
