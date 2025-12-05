"use client"

import {useSuspenseWords} from "@/features/words/hooks/use-words";
import {EntityList} from "@/components/entity-components";
import WordsEmpty from "@/features/words/components/words-empty";

export default function WordsList() {
    const words = useSuspenseWords()

    return <EntityList
        items={words.data.items}
        getKey={(word) => word.id}
        renderItem={(word) => <p>{word.german} - {word.serbian}</p>}
        emptyView={<WordsEmpty />}
    />
}