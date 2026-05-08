"use client"

import { useTRPC } from "@/trpc/client"
import { useScenariosParams } from "@/features/chat/hooks/use-scenarios-params"
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"

/**
 * Hook to fetch global (non-user) scenarios using suspense
 */
export const useSuspenseScenarios = () => {
    const trpc = useTRPC()
    const [params] = useScenariosParams()
    return useSuspenseQuery(trpc.scenarios.getMany.queryOptions(params))
}

/**
 * Hook to fetch AI-generated scenario suggestions for the current user
 */
export const useAiSuggestions = () => {
    const trpc = useTRPC()
    return useQuery(trpc.scenarios.getAiSuggestions.queryOptions())
}

/**
 * Hook to fetch user-created scenarios
 */
export const useUserScenarios = () => {
    const trpc = useTRPC()
    return useQuery(trpc.scenarios.getUserScenarios.queryOptions())
}

/**
 * Hook to generate AI scenario suggestions
 */
export const useGenerateScenarios = () => {
    const trpc = useTRPC()
    const queryClient = useQueryClient()
    return useMutation(trpc.scenarios.generateForUser.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.scenarios.getAiSuggestions.queryOptions())
        },
        onError: (error) => {
            toast.error(error.message || "Failed to generate scenarios")
        },
    }))
}

/**
 * Hook to delete a user scenario
 */
export const useRemoveUserScenario = () => {
    const trpc = useTRPC()
    const queryClient = useQueryClient()
    return useMutation(trpc.scenarios.removeUserScenario.mutationOptions({
        onSuccess: () => {
            toast.success("Scenario deleted")
            queryClient.invalidateQueries(trpc.scenarios.getUserScenarios.queryOptions())
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete scenario")
        },
    }))
}
