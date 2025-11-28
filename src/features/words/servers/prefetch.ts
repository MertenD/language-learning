import {prefetch, trpc} from "@/trpc/server";
import {inferInput} from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.words.getMany>

/**
 * Prefetch all words
 */
export const prefetchWords = (params: Input) => {
    return prefetch(trpc.words.getMany.queryOptions(params))
}