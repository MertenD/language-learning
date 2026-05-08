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

    const [chatsParams, scenariosParams, resolvedSearch] = await Promise.all([
        chatsParamsLoader(searchParams),
        scenariosParamsLoader(searchParams),
        searchParams,
    ])
    prefetchChats(chatsParams)
    prefetchScenarios(scenariosParams)

    const defaultTab = resolvedSearch.tab === "scenarios" ? "scenarios" : "conversations"

    return (
        <>
            <AppHeader breadcrumbs={breadcrumbs} />
            <main className="flex-1">
                <HydrateClient>
                    <ChatPageTabs defaultTab={defaultTab} />
                </HydrateClient>
            </main>
        </>
    )
}
