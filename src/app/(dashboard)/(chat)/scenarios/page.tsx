import {requireAuth} from "@/lib/auth-utils"
import {HydrateClient} from "@/trpc/server"
import type {SearchParams} from "nuqs/server"
import {scenariosParamsLoader} from "@/features/scenarios/server/params-loader"
import {prefetchScenarios} from "@/features/scenarios/server/prefetch"
import AppHeader from "@/components/app-header"
import {Suspense} from "react"
import {ErrorBoundary} from "react-error-boundary"
import ScenariosList from "@/features/scenarios/components/scenarios/scenarios-list"
import ScenariosLoading from "@/features/scenarios/components/scenarios/scenarios-loading"
import ScenariosError from "@/features/scenarios/components/scenarios/scenarios-error"

type ScenariosPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function ScenariosPage({searchParams}: ScenariosPageProps) {
    await requireAuth()

    const params = await scenariosParamsLoader(searchParams)
    prefetchScenarios(params)

    const breadcrumbs = [{title: "Scenarios", url: "/scenarios"}]

    return (
        <>
            <AppHeader breadcrumbs={breadcrumbs} />
            <main className="flex-1">
                <HydrateClient>
                    <div className="p-4 md:px-10 md:py-6">
                        <div className="mx-auto max-w-7xl w-full">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold tracking-tight">Scenarios</h1>
                                <p className="text-muted-foreground text-sm mt-0.5">
                                    Practice real conversations — AI-tailored to your vocabulary
                                </p>
                            </div>
                            <ErrorBoundary fallback={<ScenariosError />}>
                                <Suspense fallback={<ScenariosLoading />}>
                                    <ScenariosList />
                                </Suspense>
                            </ErrorBoundary>
                        </div>
                    </div>
                </HydrateClient>
            </main>
        </>
    )
}
