"use client"

import {useSuspenseWords} from "@/features/words/hooks/use-words";
import WordsEmpty from "@/features/words/components/words-empty";
import WordItem from "@/features/words/components/word-item";
import CategoryItem from "@/features/words/components/categories/category-item";
import {useWordsParams} from "@/features/words/hooks/use-words-params";
import {useSuspenseCategoriesByParent} from "@/features/words/hooks/use-categories";

export default function WordsList() {
    const [params] = useWordsParams()
    const words = useSuspenseWords()
    const categories = useSuspenseCategoriesByParent(params.categoryId || null)

    if (words.data.items.length === 0 && categories.data.length === 0) {
        return <WordsEmpty />
    }

    return (
        <div className="grid xl:grid-cols-2 gap-4">
            {categories.data.map((category) => (
                <CategoryItem key={category.id} category={category} />
            ))}
            {words.data.items.map((word) => (
                <WordItem key={word.id} data={word} />
            ))}
        </div>
    )
}