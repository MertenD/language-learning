import ServerTRPCFetch from "@/components/server-trpc-fetch";
import ClientTRPCFetch from "@/components/client-trpc-fetch";
import SuspenseTrpcFetchClient from "@/components/suspense-trpc-fetch-client";
import {HydrateClient, prefetch, trpc} from "@/trpc/server";
import {ErrorBoundary} from "react-error-boundary";
import {Suspense} from "react";
import {Spinner} from "@/components/ui/spinner";

export default async function UserInfo() {
    prefetch(trpc.getUser.queryOptions())

    return <div className="space-y-4">
        <ServerTRPCFetch />
        <ClientTRPCFetch />
        <HydrateClient>
            <ErrorBoundary fallback={<p>Error!</p>}>
                <Suspense fallback={<Spinner />}>
                    <SuspenseTrpcFetchClient />
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    </div>
}
