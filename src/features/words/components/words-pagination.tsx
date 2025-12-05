"use client"

import {useSuspenseWords} from "@/features/words/hooks/use-words";
import {useWordsParams} from "@/features/words/hooks/use-words-params";
import {EntityPagination} from "@/components/entity-components";

export default function WordsPagination() {
    const words = useSuspenseWords()
    const [ params, setParams ] = useWordsParams()

    return <EntityPagination
        page={words.data.page}
        totalPages={words.data.totalPages}
        onPageChange={(page) => setParams({ ...params, page })}
        disabled={words.isFetching}
    />
}