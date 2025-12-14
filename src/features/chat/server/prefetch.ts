import {prefetch, trpc} from "@/trpc/server";
import {inferInput} from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.chats.getMany>

/**
 * Prefetch all chats
 */
export const prefetchChats = (params: Input) => {
    return prefetch(trpc.chats.getMany.queryOptions(params))
}