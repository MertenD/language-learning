"use client"

import {EntitySearch} from "@/components/entity-components";
import {useEntitySearch} from "@/hooks/use-entity-search";
import {useScenariosParams} from "@/features/chat/hooks/use-scenarios-params";

export default function ScenariosSearch() {
    const [params, setParams] = useScenariosParams()
    const { searchValue, onSearchChange } = useEntitySearch({
        params: {
            page: params.scenariosPage,
            pageSize: params.scenariosPageSize,
            search: params.scenariosSearch
        },
        setParams: (newParams) => {
            setParams({
                scenariosPage: newParams.page,
                scenariosPageSize: newParams.pageSize,
                scenariosSearch: newParams.search
            })
        }
    })

    return <EntitySearch
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Szenarien durchsuchen"
    />
}

