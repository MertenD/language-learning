import {useTRPC} from "@/trpc/client";
import {useMutation, useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {toast} from "sonner";
import {useWordsParams} from "@/features/words/hooks/use-words-params";

/**
 * Hook to fetch all words using suspense
 */
export const useSuspenseWords = () => {
    const trpc = useTRPC()
    const [params] = useWordsParams()
    return useSuspenseQuery(trpc.words.getMany.queryOptions(params))
}

/**
 * Hook to create a new word
 */
export const useCreateWord = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.words.create.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Vocabulary "${data.german}" created`)
            queryClient.invalidateQueries(
                trpc.words.getMany.queryOptions({})
            )
        },
        onError: (error) => {
            toast.error(`Failed to create vocabulary: ${error.message}`)
        }
    }))
}