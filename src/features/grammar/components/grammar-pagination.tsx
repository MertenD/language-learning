"use client"

import {useWordsParams} from "@/features/words/hooks/use-words-params";
import {EntityPagination} from "@/components/entity-components";
import {useSuspenseGrammar} from "@/features/grammar/hooks/use-grammar";

export default function GrammarPagination() {
    const grammar = useSuspenseGrammar()
    const [ params, setParams ] = useWordsParams()

    return <EntityPagination
        page={grammar.data.page}
        totalPages={grammar.data.totalPages}
        onPageChange={(page) => setParams({ ...params, page })}
        disabled={grammar.isFetching}
    />
}