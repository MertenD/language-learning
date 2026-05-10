"use client"

import {EntityList} from "@/components/entity-components";
import ChatsListItem from "@/features/chat/components/chats/chats-list-item";
import {useSuspenseChats} from "@/features/chat/hooks/use-chat";
import ChatsEmpty from "@/features/chat/components/chats/chats-empty";

export default function ChatsList() {
    const chats = useSuspenseChats()

    return <EntityList
        items={chats.data.items}
        getKey={(chat) => chat.id}
        renderItem={(chat) => <ChatsListItem data={chat} />}
        emptyView={<ChatsEmpty />}
        className="grid md:grid-cols-2"
    />
}