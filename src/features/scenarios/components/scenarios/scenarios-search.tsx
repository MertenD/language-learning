"use client"

import {EntitySearch} from "@/components/entity-components";
import {useEntitySearch} from "@/hooks/use-entity-search";
import {useScenariosParams} from "@/features/scenarios/hooks/use-scenarios-params";

export default function ScenariosSearch() {
    const [params, setParams] = useScenariosParams()
    const {searchValue, onSearchChange} = useEntitySearch({
        params: {
            page: params.page,
            pageSize: params.pageSize,
            search: params.search,
        },
        setParams,
    })

    return <EntitySearch
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Szenarien durchsuchen"
    />
}
