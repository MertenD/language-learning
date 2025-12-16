"use client"

import {EntityList} from "@/components/entity-components";
import ScenariosListItem from "@/features/chat/components/scenarios/scenarios-list-item";
import ScenariosEmpty from "@/features/chat/components/scenarios/scenarios-empty";
import {useSuspenseScenarios} from "@/features/chat/hooks/use-scenarios";

export default function ScenariosList() {

    const scenarios = useSuspenseScenarios()

    return <EntityList
        items={scenarios.data.items}
        getKey={(scenario) => scenario.id}
        renderItem={(scenario) => <ScenariosListItem data={scenario}/>}
        emptyView={<ScenariosEmpty/>}
        className="grid xl:grid-cols-2"
    />
}