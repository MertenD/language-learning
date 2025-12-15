"use client"

import {EntitySearch} from "@/components/entity-components";
import {useEntitySearch} from "@/hooks/use-entity-search";
import {useChatsParams} from "@/features/chat/hooks/use-chats-params";

export default function ChatsSearch() {
    const [params, setParams] = useChatsParams()
    const { searchValue, onSearchChange } = useEntitySearch({
        params,
        setParams
    })

    return <EntitySearch
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Search Chats"
    />
}