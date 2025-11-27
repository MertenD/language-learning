import React from "react";
import {requireAuth} from "@/lib/auth-utils";
import AppHeader from "@/components/app-header";

export default async function Layout({ children}: { children: React.ReactNode }) {
    await requireAuth()

    return <>
        <AppHeader />
        <main className="flex-1">{children}</main>
    </>
}