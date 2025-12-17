import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {polarClient} from "@/lib/polar";
import {Session, User} from "better-auth";

export const requireAuth = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/login")
    }

    return session
}

export const requireAuthAndPremium = async (nonPremiumRedirectUrl: string = "/") => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/login")
    }

    const customer = await polarClient.customers.getStateExternal({
        externalId: session.user.id
    })

    if (!customer.activeSubscriptions || customer.activeSubscriptions.length === 0) {
        redirect(nonPremiumRedirectUrl)
    }

    return session
}

export const requireUnauth = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (session) {
        redirect("/")
    }

    return session
}

export const getSessionOnServer = async () => {
    return auth.api.getSession({
        headers: await headers()
    })
}

export async function requirePremiumUserFromRequest(req: Request): Promise<{
    session: Session,
    user: User
}> {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        throw new Response("Unauthorized", { status: 401 })
    }

    const customer = await polarClient.customers.getStateExternal({
        externalId: session.user.id
    })

    if (!customer.activeSubscriptions || customer.activeSubscriptions.length === 0) {
        throw new Response("Premium required", { status: 403 })
    }

    return session
}