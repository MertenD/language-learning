"use client"

import {EntityPagination} from "@/components/entity-components";
import {useChatsParams} from "@/features/chat/hooks/use-chats-params";
import {useSuspenseChats} from "@/features/chat/hooks/use-chat";

export default function ChatsPagination() {
    const chats = useSuspenseChats()
    const [ params, setParams ] = useChatsParams()

    return <EntityPagination
        page={chats.data.page}
        totalPages={chats.data.totalPages}
        onPageChange={(page) => setParams({ ...params, page })}
        disabled={chats.isFetching}
    />
}