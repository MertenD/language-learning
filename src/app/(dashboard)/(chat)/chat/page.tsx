import {requireAuth} from "@/lib/auth-utils";
import {HydrateClient} from "@/trpc/server";
import {ErrorBoundary} from "react-error-boundary";
import {Suspense} from "react";
import type {SearchParams} from "nuqs/server";
import {chatsParamsLoader} from "@/features/chat/server/params-loader";
import {prefetchChats} from "@/features/chat/server/prefetch";
import ChatsContainer from "@/features/chat/components/chats/chats-container";
import ChatsError from "@/features/chat/components/chats/chats-error";
import ChatsLoading from "@/features/chat/components/chats/chats-loading";
import ChatsList from "@/features/chat/components/chats/chats-list";

type ChatPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
    await requireAuth()

    const params = await chatsParamsLoader(searchParams)
    prefetchChats(params)

    return <ChatsContainer>
        <HydrateClient>
            <ErrorBoundary fallback={<ChatsError />}>
                <Suspense fallback={<ChatsLoading />}>
                    <ChatsList />
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    </ChatsContainer>
}

