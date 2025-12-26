import {prefetch, trpc} from "@/trpc/server";
import {inferInput} from "@trpc/tanstack-react-query";

type PrefetchWordsInput = inferInput<typeof trpc.words.getMany>
type PrefetchCategoriesInput = inferInput<typeof trpc.categories.getCategories>

/**
 * Prefetch all words
 */
export const prefetchWords = (params: PrefetchWordsInput) => {
    return prefetch(trpc.words.getMany.queryOptions(params))
}

/**
 * Prefetch all categories
 */
export const prefetchCategories = (params: PrefetchCategoriesInput) => {
    return prefetch(trpc.categories.getCategories.queryOptions(params))
}