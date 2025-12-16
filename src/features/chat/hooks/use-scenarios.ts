"use client"

import {useTRPC} from "@/trpc/client";
import {useScenariosParams} from "@/features/chat/hooks/use-scenarios-params";
import {useSuspenseQuery} from "@tanstack/react-query";

/**
 * Hook to fetch all scenarios using suspense
 */
export const useSuspenseScenarios = () => {
    const trpc = useTRPC()
    const [params] = useScenariosParams()
    return useSuspenseQuery(trpc.scenarios.getMany.queryOptions(params))
}

