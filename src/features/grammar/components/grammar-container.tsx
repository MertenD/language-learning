import React from "react";
import {EntityContainer} from "@/components/entity-components";
import GrammarHeader from "@/features/grammar/components/grammar-header";
import GrammarSearch from "@/features/grammar/components/grammar-search";
import GrammarPagination from "@/features/grammar/components/grammar-pagination";

type GrammarContainerProps = {
    children: React.ReactNode
}

export default function GrammarContainer({ children }: GrammarContainerProps) {

    return (
        <EntityContainer
            header={<GrammarHeader />}
            search={<GrammarSearch />}
            pagination={<GrammarPagination />}
        >
            {children}
        </EntityContainer>
    )
}