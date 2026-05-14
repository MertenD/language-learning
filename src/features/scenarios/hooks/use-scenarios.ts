"use client"

import {useTRPC} from "@/trpc/client"
import {useScenariosParams} from "@/features/scenarios/hooks/use-scenarios-params"
import {useMutation, useQuery, useQueryClient, useSuspenseQuery} from "@tanstack/react-query"
import {toast} from "sonner"

export const useSuspenseScenarios = () => {
    const trpc = useTRPC()
    const [params] = useScenariosParams()
    return useSuspenseQuery(trpc.scenarios.getMany.queryOptions(params))
}

export const useAiSuggestions = () => {
    const trpc = useTRPC()
    return useQuery(trpc.scenarios.getAiSuggestions.queryOptions())
}

export const useUserScenarios = () => {
    const trpc = useTRPC()
    return useQuery(trpc.scenarios.getUserScenarios.queryOptions())
}

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

export const useSaveAiScenario = () => {
    const trpc = useTRPC()
    const queryClient = useQueryClient()
    return useMutation(trpc.scenarios.saveAiScenario.mutationOptions({
        onSuccess: () => {
            toast.success("Szenario gespeichert")
            queryClient.invalidateQueries(trpc.scenarios.getUserScenarios.queryOptions())
        },
        onError: (error) => {
            toast.error(error.message || "Failed to save scenario")
        },
    }))
}

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
