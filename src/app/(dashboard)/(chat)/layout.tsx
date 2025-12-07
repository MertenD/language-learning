import React from "react";
import {requireAuth} from "@/lib/auth-utils";
import AppHeader from "@/components/app-header";

export default async function Layout({ children}: { children: React.ReactNode }) {
    await requireAuth()

    return <div className="flex h-screen flex-col">
        <AppHeader />
        <main className="flex-1 min-h-0">{children}</main>
    </div>
}