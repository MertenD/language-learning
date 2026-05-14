"use client"

import {useTRPC} from "@/trpc/client"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {toast} from "sonner"

export const useScenarioSessions = () => {
    const trpc = useTRPC()
    return useQuery(trpc.sessions.getMany.queryOptions({}))
}

export const useCreateSession = () => {
    const trpc = useTRPC()
    const queryClient = useQueryClient()
    return useMutation(trpc.sessions.createFromScenario.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(trpc.sessions.getMany.queryOptions({}))
        },
        onError: (error) => {
            toast.error(`Failed to start scenario: ${error.message}`)
        },
    }))
}

export const useRemoveSession = () => {
    const trpc = useTRPC()
    const queryClient = useQueryClient()
    return useMutation(trpc.sessions.remove.mutationOptions({
        onSuccess: () => {
            toast.success("Session deleted")
            queryClient.invalidateQueries(trpc.sessions.getMany.queryOptions({}))
        },
        onError: (error) => {
            toast.error(`Failed to delete session: ${error.message}`)
        },
    }))
}
