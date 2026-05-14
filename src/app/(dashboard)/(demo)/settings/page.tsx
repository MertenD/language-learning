import {requireAuth} from "@/lib/auth-utils";
import {HydrateClient, prefetch, trpc} from "@/trpc/server";
import AppHeader from "@/components/app-header";
import SettingsPage from "@/features/settings/components/settings-page";

export default async function SettingsRoute() {
    await requireAuth()

    prefetch(trpc.user.getLanguages.queryOptions())
    prefetch(trpc.user.getAvailableLanguages.queryOptions())
    prefetch(trpc.user.getNativeLanguage.queryOptions())
    prefetch(trpc.user.getIsCredentialUser.queryOptions())

    const breadcrumbs = [{ title: "Settings", url: "/settings" }]

    return <>
        <AppHeader breadcrumbs={breadcrumbs} />
        <main className="flex-1">
            <HydrateClient>
                <SettingsPage />
            </HydrateClient>
        </main>
    </>
}
