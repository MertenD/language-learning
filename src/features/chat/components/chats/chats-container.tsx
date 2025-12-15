import React from "react";
import {EntityContainer} from "@/components/entity-components";
import ChatsHeader from "@/features/chat/components/chats/chats-header";
import ChatsSearch from "@/features/chat/components/chats/chats-search";
import ChatsPagination from "@/features/chat/components/chats/chats-pagination";

type ChatsContainerProps = {
    children: React.ReactNode
}

export default function ChatsContainer({ children }: ChatsContainerProps) {

    return <div className="h-100">
        <EntityContainer
            header={<ChatsHeader />}
            search={<ChatsSearch />}
            pagination={<ChatsPagination />}
        >
            {children}
        </EntityContainer>
    </div>
}