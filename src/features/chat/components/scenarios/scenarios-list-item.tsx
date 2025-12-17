"use client"

import {Scenario} from "@/config/scenarios-data";
import React from "react";
import {Card, CardContent} from "@/components/ui/card";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {useCreateChatFromScenario} from "@/features/chat/hooks/use-chat";
import {useUpgradeModal} from "@/hooks/use-upgrade-modal";

export default function ScenariosListItem({ data }: { data: Scenario }) {
    const createChat = useCreateChatFromScenario()
    const { handleError, modal } = useUpgradeModal()

    const router = useRouter()

    const handleCreateChat = () => {
        createChat.mutate({
            title: data.title,
            systemMessage: data.assistantInstructions,
            firstAssistantMessage: data.firstAssistantMessage
        }, {
            onSuccess: (chatId) => {
                router.push(`/chat/${chatId}`)
            },
            onError: (error) => {
                handleError(error)
            }
        })
    }

    return <button
        disabled={createChat.isPending}
        onClick={handleCreateChat}
        className="w-full text-left"
    >
        <Card
            className={cn(
                "p-2 shadow-none hover:shadow cursor-pointer transition-shadow px-0",
                (createChat.isPending) && "opacity-50 cursor-not-allowed"
            )}
        >
            <CardContent className="px-2">
                <div className="flex items-start gap-4 p-2">
                    <div className="flex-shrink-0 mt-1">
                        <div className="flex size-16 items-center justify-center rounded-lg bg-primary/10 text-3xl">
                            {data.image}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground text-balance">{data.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {data.description}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </button>
}

