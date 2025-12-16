"use client"

import {EntityPagination} from "@/components/entity-components";
import {useScenariosParams} from "@/features/chat/hooks/use-scenarios-params";
import {useSuspenseScenarios} from "@/features/chat/hooks/use-scenarios";

export default function ScenariosPagination() {
    const scenarios = useSuspenseScenarios()
    const [ params, setParams ] = useScenariosParams()

    return <EntityPagination
        page={scenarios.data.page}
        totalPages={scenarios.data.totalPages}
        onPageChange={(page) => setParams({ ...params, scenariosPage: page })}
        disabled={false}
    />
}

