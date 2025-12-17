import {useTRPC} from "@/trpc/client";
import {useChatsParams} from "@/features/chat/hooks/use-chats-params";
import {useMutation, useQuery, useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {toast} from "sonner";

/**
 * Hook to fetch all chats using suspense
 */
export const useSuspenseChats = () => {
    const trpc = useTRPC()
    const [params] = useChatsParams()
    return useSuspenseQuery(trpc.chats.getMany.queryOptions(params))
}

/**
 * Hook to remove a chat
 */
export const useRemoveChat = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.chats.remove.mutationOptions({
        onSuccess: (data) => {
            // TODO Replace id with chat title when available
            toast.success(`Chat "${data.id}" deleted`)
            queryClient.invalidateQueries(
                trpc.chats.getMany.queryOptions({})
            )
        },
        onError: (error) => {
            toast.error(`Failed to delete chat: ${error.message}`)
        }
    }))
}

/**
 * Hook to create a new chat from scenarios
 */
export const useCreateChatFromScenario = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.chats.createChatFromScenario.mutationOptions({
        onSuccess: () => {
            toast.success("Created chat from scenario")
            queryClient.invalidateQueries(
                trpc.chats.getMany.queryOptions({})
            )
        },
        onError: (error) => {
            toast.error(`Failed to create grammar: ${error.message}`)
        }
    }))
}

/**
 * Hook to create an empty chat
 */
export const useCreateEmptyChat = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.chats.createEmptyChat.mutationOptions({
        onSuccess: () => {
            toast.success("Created new empty chat")
            queryClient.invalidateQueries(
                trpc.chats.getMany.queryOptions({})
            )
        },
        onError: (error) => {
            toast.error(`Failed to create chat: ${error.message}`)
        }
    }))
}