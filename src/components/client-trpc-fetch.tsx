"use client"

import {useTRPC} from "@/trpc/client";
import {useQuery} from "@tanstack/react-query";

export default function ClientTRPCFetch() {

    const trpc = useTRPC()
    const { data: users } = useQuery(trpc.getUser.queryOptions())

    return <div>
        Client Component {JSON.stringify(users)}
    </div>
}