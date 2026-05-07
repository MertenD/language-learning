import {useTRPC} from "@/trpc/client";
import {useMutation, useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {toast} from "sonner";

/**
 * Hook to fetch categories by parent
 */
export const useSuspenseCategoriesByParent = (parentId?: string | null) => {
    const trpc = useTRPC()
    return useSuspenseQuery(trpc.categories.getCategories.queryOptions({ parentId }))
}

/**
 * Hook to fetch category path
 */
export const useCategoryPath = (categoryId?: string | null) => {
    const trpc = useTRPC()
    return useSuspenseQuery(trpc.categories.getCategoryPath.queryOptions(
        { id: categoryId },
    ))
}

/**
 * Hook to create a new category
 */
export const useCreateCategory = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.categories.createCategory.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Category "${data.name}" created`)
            queryClient.invalidateQueries(
                trpc.categories.getCategories.queryOptions({ parentId: data.parentId })
            )
        },
        onError: (error) => {
            toast.error(`Failed to create category: ${error.message}`)
        }
    }))
}

/**
 * Hook to remove a category
 */
export const useRemoveCategory = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.categories.removeCategory.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Category "${data.name}" deleted`)
            queryClient.invalidateQueries(
                trpc.categories.getCategories.queryOptions({ parentId: data.parentId })
            )
        },
        onError: (error) => {
            toast.error(`Failed to delete category: ${error.message}`)
        }
    }))
}

/**
 * Hook to update (rename) a category
 */
export const useUpdateCategory = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.categories.updateCategory.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Category renamed to "${data.name}"`)
            queryClient.invalidateQueries(
                trpc.categories.getCategories.queryOptions({ parentId: data.parentId })
            )
            queryClient.invalidateQueries(
                trpc.categories.getAllCategories.queryOptions()
            )
        },
        onError: (error) => {
            toast.error(`Failed to rename category: ${error.message}`)
        }
    }))
}

/**
 * Hook to fetch all categories
 */
export const useSuspenseAllCategories = () => {
    const trpc = useTRPC()
    return useSuspenseQuery(trpc.categories.getAllCategories.queryOptions())
}