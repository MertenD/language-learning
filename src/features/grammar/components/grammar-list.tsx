"use client"

import {EntityList} from "@/components/entity-components";
import GrammarEmpty from "@/features/grammar/components/grammar-empty";
import GrammarItem from "@/features/grammar/components/grammar-item";
import {useSuspenseGrammar} from "@/features/grammar/hooks/use-grammar";

export default function GrammarList() {
    const grammar = useSuspenseGrammar()

    return <EntityList
        items={grammar.data.items}
        getKey={(grammar) => grammar.id}
        renderItem={(grammar) => <GrammarItem data={grammar} />}
        emptyView={<GrammarEmpty />}
        className="grid xl:grid-cols-2"
    />
}