import {prefetch, trpc} from "@/trpc/server";
import {inferInput} from "@trpc/tanstack-react-query";

type ChatsInput = inferInput<typeof trpc.chats.getMany>
type ScenariosInput = inferInput<typeof trpc.scenarios.getMany>

/**
 * Prefetch all chats
 */
export const prefetchChats = (params: ChatsInput) => {
    return prefetch(trpc.chats.getMany.queryOptions(params))
}

/**
 * Prefetch all scenarios
 */
export const prefetchScenarios = (params: ScenariosInput) => {
    return prefetch(trpc.scenarios.getMany.queryOptions(params))
}