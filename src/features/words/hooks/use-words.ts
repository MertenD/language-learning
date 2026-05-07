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
            toast.success(`Vocabulary "${data.primary}" created`)
            queryClient.invalidateQueries(
                trpc.words.getMany.queryOptions({})
            )
        },
        onError: (error) => {
            toast.error(`Failed to create vocabulary: ${error.message}`)
        }
    }))
}

/**
 * Hook to update vocabulary
 */
export const useUpdateWord = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.words.update.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Vocabulary "${data.primary}" updated`)
            queryClient.invalidateQueries(
                trpc.words.getMany.queryOptions({})
            )
            queryClient.invalidateQueries(
                trpc.words.getOne.queryOptions({ id: data.id })
            )
        },
        onError: (error) => {
            toast.error(`Failed to update vocabulary: ${error.message}`)
        }
    }))
}

/**
 * Hook to import vocabulary
 */
export const useImportWords = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.words.import.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Successfully imported ${data.count} words`)
            queryClient.invalidateQueries(
                trpc.words.getMany.queryOptions({})
            )
            queryClient.invalidateQueries(
                trpc.words.getAll.queryOptions({})
            )
            queryClient.invalidateQueries(
                trpc.categories.getAllCategories.queryOptions()
            )
        },
        onError: (error) => {
            toast.error(error.message || "Failed to import words")
        }
    }))
}

/**
 * Hook to export vocabulary
 */
export const useExportWords = () => {
    const trpc = useTRPC()

    return useMutation(trpc.words.export.mutationOptions({
        onError: (error) => {
            toast.error(error.message || "Failed to export vocabulary")
        }
    }))
}

/**
 * Hook to generate vocabulary via AI
 */
export const useGenerateWords = () => {
    const trpc = useTRPC()
    return useMutation(trpc.words.generateWords.mutationOptions())
}

/**
 * Hook to bulk-create vocabulary
 */
export const useBulkCreateWords = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.words.bulkCreate.mutationOptions({
        onSuccess: (data) => {
            toast.success(`${data.count} word${data.count !== 1 ? "s" : ""} added`)
            queryClient.invalidateQueries(trpc.words.getMany.queryOptions({}))
            queryClient.invalidateQueries(trpc.words.getAll.queryOptions({}))
        },
        onError: (error) => {
            toast.error(`Failed to save words: ${error.message}`)
        }
    }))
}

/**
 * Hook to bulk-delete vocabulary
 */
export const useBulkDeleteWords = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.words.bulkDelete.mutationOptions({
        onSuccess: (data) => {
            toast.success(`${data.count} word${data.count !== 1 ? "s" : ""} deleted`)
            queryClient.invalidateQueries(trpc.words.getMany.queryOptions({}))
        },
        onError: (error) => {
            toast.error(`Failed to delete words: ${error.message}`)
        }
    }))
}

/**
 * Hook to remove vocabulary
 */
export const useRemoveWord = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.words.remove.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Vocabulary "${data.primary}" deleted`)
            queryClient.invalidateQueries(
                trpc.words.getMany.queryOptions({})
            )
            queryClient.invalidateQueries(
                trpc.words.getOne.queryOptions({ id: data.id })
            )
        },
        onError: (error) => {
            toast.error(`Failed to delete vocabulary: ${error.message}`)
        }
    }))
}