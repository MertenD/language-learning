"use server"

import {caller} from "@/trpc/server";

export default async function ServerTRPCFetch() {

    const users = await caller.getUser()

    return <div>
        Server Component: {JSON.stringify(users)}
    </div>
}