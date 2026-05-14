import {useTRPC} from "@/trpc/client";
import {useChatsParams} from "@/features/chat/hooks/use-chats-params";
import {useMutation, useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {toast} from "sonner";

export const useSuspenseChats = () => {
    const trpc = useTRPC()
    const [params] = useChatsParams()
    return useSuspenseQuery(trpc.chats.getMany.queryOptions(params))
}

export const useRemoveChat = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.chats.remove.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Chat "${data.id}" deleted`)
            queryClient.invalidateQueries(trpc.chats.getMany.queryOptions({}))
        },
        onError: (error) => {
            toast.error(`Failed to delete chat: ${error.message}`)
        }
    }))
}

export const useCreateEmptyChat = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.chats.createEmptyChat.mutationOptions({
        onSuccess: () => {
            toast.success("Created new empty chat")
            queryClient.invalidateQueries(trpc.chats.getMany.queryOptions({}))
        },
        onError: (error) => {
            toast.error(`Failed to create chat: ${error.message}`)
        }
    }))
}
