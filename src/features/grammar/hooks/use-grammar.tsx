import {useTRPC} from "@/trpc/client";
import {useMutation, useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {toast} from "sonner";
import {useGrammarParams} from "@/features/grammar/hooks/use-grammar-params";

/**
 * Hook to fetch all grammar using suspense
 */
export const useSuspenseGrammar = () => {
    const trpc = useTRPC()
    const [params] = useGrammarParams()
    return useSuspenseQuery(trpc.grammar.getMany.queryOptions(params))
}

/**
 * Hook to create a new grammar
 */
export const useCreateGrammar = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.grammar.create.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Grammar "${data.title}" created`)
            queryClient.invalidateQueries(
                trpc.grammar.getMany.queryOptions({})
            )
        },
        onError: (error) => {
            toast.error(`Failed to create grammar: ${error.message}`)
        }
    }))
}

/**
 * Hook to update grammar
 */
export const useUpdateGrammar = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.grammar.update.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Grammar "${data.title}" updated`)
            queryClient.invalidateQueries(
                trpc.grammar.getMany.queryOptions({})
            )
            queryClient.invalidateQueries(
                trpc.grammar.getOne.queryOptions({ id: data.id })
            )
        },
        onError: (error) => {
            toast.error(`Failed to update grammar: ${error.message}`)
        }
    }))
}

/**
 * Hook to remove a grammar
 */
export const useRemoveGrammar = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.grammar.remove.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Grammar "${data.title}" deleted`)
            queryClient.invalidateQueries(
                trpc.grammar.getMany.queryOptions({})
            )
            queryClient.invalidateQueries(
                trpc.grammar.getOne.queryOptions({ id: data.id })
            )
        },
        onError: (error) => {
            toast.error(`Failed to delete grammar: ${error.message}`)
        }
    }))
}