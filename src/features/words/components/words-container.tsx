import React from "react";
import WordsHeader from "@/features/words/components/words-header";
import {EntityContainer} from "@/components/entity-components";
import WordsSearch from "@/features/words/components/words-search";
import WordsPagination from "@/features/words/components/words-pagination";
import WordsBreadcrumbs from "@/features/words/components/words-breadcrumbs";

type WordsContainerProps = {
    children: React.ReactNode
}

export default function WordsContainer({ children }: WordsContainerProps) {

    return (
        <EntityContainer
            header={<WordsHeader />}
            search={<WordsSearch />}
            pagination={<WordsPagination />}
        >
            <WordsBreadcrumbs />
            {children}
        </EntityContainer>
    )
}