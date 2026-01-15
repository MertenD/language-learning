import React from "react";
import {requireAuth} from "@/lib/auth-utils";

export default async function Layout({ children }: { children: React.ReactNode }) {
    await requireAuth()

    return children
}