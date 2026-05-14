import {requireAuthAndPremium} from "@/lib/auth-utils"
import {loadSession} from "@/features/scenarios/server/session-store"
import {redirect} from "next/navigation"
import prisma from "@/lib/db"
import AppHeader from "@/components/app-header"
import ScenarioSessionPage from "@/features/scenarios/components/session/scenario-session-page"

export default async function ScenarioSessionRoutePage({params}: {params: Promise<{id: string}>}) {
    const session = await requireAuthAndPremium("/scenarios")
    const {id} = await params

    let scenarioSession
    try {
        scenarioSession = await loadSession(id, session.user.id)
    } catch {
        redirect("/scenarios")
    }

    const scenario = await prisma.scenario.findUnique({
        where: {id: scenarioSession.scenarioId}
    })

    if (!scenario) {
        redirect("/scenarios")
    }

    const breadcrumbs = [
        {title: "Scenarios", url: "/scenarios"},
        {title: scenario.title, url: `/scenarios/${scenarioSession.id}`},
    ]

    return (
        <>
            <AppHeader breadcrumbs={breadcrumbs} />
            <main className="flex-1 min-h-0">
                <div className="h-full">
                    <ScenarioSessionPage session={scenarioSession} scenario={scenario} />
                </div>
            </main>
        </>
    )
}
