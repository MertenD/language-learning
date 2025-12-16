"use client"

import React from "react";
import {EntityContainer} from "@/components/entity-components";
import ScenariosHeader from "@/features/chat/components/scenarios/scenarios-header";
import ScenariosSearch from "@/features/chat/components/scenarios/scenarios-search";
import ScenariosPagination from "@/features/chat/components/scenarios/scenarios-pagination";

type ScenariosContainerProps = {
    children: React.ReactNode
}

export default function ScenariosContainer({ children }: ScenariosContainerProps) {
    return <div className="h-full">
        <EntityContainer
            header={<ScenariosHeader />}
            search={<ScenariosSearch />}
            pagination={<ScenariosPagination />}
        >
            {children}
        </EntityContainer>
    </div>
}

