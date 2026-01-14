import React from "react";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import {requireAuth} from "@/lib/auth-utils";

export default async function Layout({ children}: { children: React.ReactNode }) {
    await requireAuth()

    return <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-background overflow-y-auto">
            {children}
        </SidebarInset>
    </SidebarProvider>
}