import {prefetch, trpc} from "@/trpc/server";
import {inferInput} from "@trpc/tanstack-react-query";

type ScenariosInput = inferInput<typeof trpc.scenarios.getMany>

export const prefetchScenarios = (params: ScenariosInput) => {
    return prefetch(trpc.scenarios.getMany.queryOptions(params))
}
