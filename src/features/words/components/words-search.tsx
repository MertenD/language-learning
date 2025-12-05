"use client"

import {EntitySearch} from "@/components/entity-components";
import {useWordsParams} from "@/features/words/hooks/use-words-params";
import {useEntitySearch} from "@/hooks/use-entity-search";

export default function WordsSearch() {
    const [params, setParams] = useWordsParams()
    const { searchValue, onSearchChange } = useEntitySearch({
        params,
        setParams
    })

    return <EntitySearch
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Search Words"
    />
}