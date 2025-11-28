"use client"

import {useSuspenseWords} from "@/features/words/hooks/use-words";

export default function WordsList() {

    const words = useSuspenseWords()

    return <div className="flex flex-1 justify-center items-center">
        {JSON.stringify(words.data, null, 2)}
    </div>
}