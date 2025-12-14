import React from "react";
import WordsHeader from "@/features/words/components/words-header";
import {EntityContainer} from "@/components/entity-components";
import WordsSearch from "@/features/words/components/words-search";
import WordsPagination from "@/features/words/components/words-pagination";
import ChatsHeader from "@/features/chat/components/chats-header";
import ChatsSearch from "@/features/chat/components/chats-search";
import ChatsPagination from "@/features/chat/components/chats-pagination";

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
            {chi
                ldren}
        </EntityContainer>
    </div>
}