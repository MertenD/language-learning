import {requireAuth} from "@/lib/auth-utils"
import {HydrateClient} from "@/trpc/server"
import type {SearchParams} from "nuqs/server"
import {chatsParamsLoader} from "@/features/chat/server/params-loader"
import {prefetchChats} from "@/features/chat/server/prefetch"
import AppHeader from "@/components/app-header"
import ChatPageContent from "@/features/chat/components/chat-page-content"

type ChatPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function ChatPage({searchParams}: ChatPageProps) {
    await requireAuth()

    const breadcrumbs = [{title: "Chat", url: "/chat"}]

    const params = await chatsParamsLoader(searchParams)
    prefetchChats(params)

    return (
        <>
            <AppHeader breadcrumbs={breadcrumbs} />
            <main className="flex-1">
                <HydrateClient>
                    <ChatPageContent />
                </HydrateClient>
            </main>
        </>
    )
}
