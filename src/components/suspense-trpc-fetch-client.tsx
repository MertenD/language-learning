"use client"

import {useSuspenseQuery} from "@tanstack/react-query";
import {useTRPC} from "@/trpc/client";

export default function SuspenseTrpcFetchClient() {

    const trpc = useTRPC()
    const { data: users } = useSuspenseQuery(trpc.getUser.queryOptions())

    return <div>
        Client Component Prefetch: {JSON.stringify(users)}
    </div>
}