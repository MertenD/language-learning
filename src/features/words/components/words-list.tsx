"use client"

import {useSuspenseWords} from "@/features/words/hooks/use-words";
import {EntityList} from "@/components/entity-components";
import WordsEmpty from "@/features/words/components/words-empty";
import WordItem from "@/features/words/components/word-item";

export default function WordsList() {
    const words = useSuspenseWords()

    return <EntityList
        items={words.data.items}
        getKey={(word) => word.id}
        renderItem={(word) => <WordItem data={word} />}
        emptyView={<WordsEmpty />}
    />
}