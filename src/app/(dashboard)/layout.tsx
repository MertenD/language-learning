import React from "react";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import {requireAuth} from "@/lib/auth-utils";
import {HydrateClient, prefetch, trpc} from "@/trpc/server";

export default async function Layout({ children}: { children: React.ReactNode }) {
    const session = await requireAuth()

    if (session.user.currentLanguageId) {
        await prefetch(trpc.user.getLanguageStats.queryOptions({
            languageId: session.user.currentLanguageId
        }))
    }

    return <HydrateClient>
        <SidebarProvider>
            <AppSidebar username={session.user.name.split("@")[0]} />
            <SidebarInset className="bg-background overflow-y-auto">
                {children}
            </SidebarInset>
        </SidebarProvider>
    </HydrateClient>
}