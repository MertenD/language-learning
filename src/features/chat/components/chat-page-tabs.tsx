"use client"

import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, MessageSquarePlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCreateEmptyChat } from "@/features/chat/hooks/use-chat"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"
import { createChatSystemMessage } from "@/features/chat/utils/prompts"
import ChatsList from "@/features/chat/components/chats/chats-list"
import ChatsSearch from "@/features/chat/components/chats/chats-search"
import ChatsPagination from "@/features/chat/components/chats/chats-pagination"
import ChatsLoading from "@/features/chat/components/chats/chats-loading"
import ChatsError from "@/features/chat/components/chats/chats-error"
import ScenariosList from "@/features/chat/components/scenarios/scenarios-list"
import ScenariosLoading from "@/features/chat/components/scenarios/scenarios-loading"
import ScenariosError from "@/features/chat/components/scenarios/scenarios-error"

type ChatPageTabsProps = {
    defaultTab?: string
}

export default function ChatPageTabs({ defaultTab }: ChatPageTabsProps) {
    const createEmptyChat = useCreateEmptyChat()
    const router = useRouter()
    const { handleError, modal } = useUpgradeModal()

    const activeTab = defaultTab === "scenarios" ? "scenarios" : "conversations"

    const handleTabChange = (value: string) => {
        const url = value === "conversations" ? "/chat" : `/chat?tab=${value}`
        router.replace(url, { scroll: false })
    }

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
            <div className="p-4 md:px-10 md:py-6">
                <div className="mx-auto max-w-7xl w-full">

                    {/* Page header */}
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Chat</h1>
                            <p className="text-muted-foreground text-sm mt-0.5">
                                Practice with AI in real conversations
                            </p>
                        </div>
                        <Button onClick={handleNewChat} disabled={createEmptyChat.isPending} className="shrink-0">
                            {createEmptyChat.isPending
                                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                : <MessageSquarePlusIcon className="mr-2 h-4 w-4" />
                            }
                            New Chat
                        </Button>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        <TabsList className="mb-6">
                            <TabsTrigger value="conversations">Conversations</TabsTrigger>
                            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                        </TabsList>

                        <TabsContent value="conversations">
                            <div className="space-y-4">
                                <ChatsSearch />
                                <ErrorBoundary fallback={<ChatsError />}>
                                    <Suspense fallback={<ChatsLoading />}>
                                        <ChatsList />
                                        <ChatsPagination />
                                    </Suspense>
                                </ErrorBoundary>
                            </div>
                        </TabsContent>

                        <TabsContent value="scenarios">
                            <ErrorBoundary fallback={<ScenariosError />}>
                                <Suspense fallback={<ScenariosLoading />}>
                                    <ScenariosList />
                                </Suspense>
                            </ErrorBoundary>
                        </TabsContent>
                    </Tabs>

                </div>
            </div>
        </>
    )
}
