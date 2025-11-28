import React from "react";
import WordsHeader from "@/features/words/components/words-header";
import {EntityContainer} from "@/components/entity-components";

type WordsContainerProps = {
    children: React.ReactNode
}

export default function WordsContainer({ children }: WordsContainerProps) {

    return (
        <EntityContainer
            header={<WordsHeader />}
            search={<></>}
            pagination={<></>}
        >
            {children}
        </EntityContainer>
    )
}