"use client"

import {EntitySearch} from "@/components/entity-components";
import {useEntitySearch} from "@/hooks/use-entity-search";
import {useGrammarParams} from "@/features/grammar/hooks/use-grammar-params";

export default function GrammarSearch() {
    const [params, setParams] = useGrammarParams()
    const { searchValue, onSearchChange } = useEntitySearch({
        params,
        setParams
    })

    return <EntitySearch
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Search Grammar"
    />
}