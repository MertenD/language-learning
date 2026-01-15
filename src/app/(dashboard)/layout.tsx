import React from "react";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import {requireAuth} from "@/lib/auth-utils";
import {authClient} from "@/lib/auth-client";

export default async function Layout({ children}: { children: React.ReactNode }) {
    const session = await requireAuth()

    return <SidebarProvider>
        <AppSidebar username={session.user.name.split("@")[0]} />
        <SidebarInset className="bg-background overflow-y-auto">
            {children}
        </SidebarInset>
    </SidebarProvider>
}