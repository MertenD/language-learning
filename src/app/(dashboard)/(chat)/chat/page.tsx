import { requireAuth } from "@/lib/auth-utils"
import { HydrateClient } from "@/trpc/server"
import type { SearchParams } from "nuqs/server"
import { chatsParamsLoader, scenariosParamsLoader } from "@/features/chat/server/params-loader"
import { prefetchChats, prefetchScenarios } from "@/features/chat/server/prefetch"
import AppHeader from "@/components/app-header"
import ChatPageTabs from "@/features/chat/components/chat-page-tabs"

type ChatPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
    await requireAuth()

    const breadcrumbs = [{ title: "Chat", url: "/chat" }]

    const [chatsParams, scenariosParams] = await Promise.all([
        chatsParamsLoader(searchParams),
        scenariosParamsLoader(searchParams),
    ])
    prefetchChats(chatsParams)
    prefetchScenarios(scenariosParams)

    return (
        <>
            <AppHeader breadcrumbs={breadcrumbs} />
            <main className="flex-1">
                <HydrateClient>
                    <ChatPageTabs />
                </HydrateClient>
            </main>
        </>
    )
}
