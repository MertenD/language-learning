import {prefetch, trpc} from "@/trpc/server";
import {inferInput} from "@trpc/tanstack-react-query";

type ChatsInput = inferInput<typeof trpc.chats.getMany>

export const prefetchChats = (params: ChatsInput) => {
    return prefetch(trpc.chats.getMany.queryOptions(params))
}
