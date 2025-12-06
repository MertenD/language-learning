import {prefetch, trpc} from "@/trpc/server";
import {inferInput} from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.grammar.getMany>

/**
 * Prefetch all grammar
 */
export const prefetchGrammar = (params: Input) => {
    return prefetch(trpc.grammar.getMany.queryOptions(params))
}