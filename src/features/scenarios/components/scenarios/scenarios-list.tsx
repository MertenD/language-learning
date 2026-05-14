"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, PlusIcon, RefreshCwIcon, SparklesIcon } from "lucide-react"
import ScenariosListItem from "@/features/scenarios/components/scenarios/scenarios-list-item"
import ScenariosEmpty from "@/features/scenarios/components/scenarios/scenarios-empty"
import { ScenarioEditorDialog } from "@/features/scenarios/components/scenarios/scenario-editor-dialog"
import { useAiSuggestions, useGenerateScenarios, useSuspenseScenarios, useUserScenarios } from "@/features/scenarios/hooks/use-scenarios"
import type { Scenario } from "@/generated/prisma/client"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"
import PastSessionsSection from "@/features/scenarios/components/scenarios/past-sessions-section"

export default function ScenariosList() {
    const globalScenarios = useSuspenseScenarios()
    const aiSuggestions = useAiSuggestions()
    const userScenarios = useUserScenarios()
    const generate = useGenerateScenarios()
    const { handleError, modal } = useUpgradeModal()

    const [editScenario, setEditScenario] = useState<Scenario | null>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    const handleGenerate = (force: boolean) => {
        generate.mutate({ force }, { onError: handleError })
    }

    const aiScenarios = aiSuggestions.data ?? []
    const userOwned = userScenarios.data ?? []
    const global = globalScenarios.data.items

    return (
        <>
            {modal}
            <ScenarioEditorDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
            <ScenarioEditorDialog
                open={!!editScenario}
                onOpenChange={open => { if (!open) setEditScenario(null) }}
                scenario={editScenario}
            />

            <div className="space-y-8">
                <PastSessionsSection />

                <div className="flex items-center justify-between h-10">
                    <p className="text-sm text-muted-foreground">
                        Practice conversations in specific situations
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)}>
                        <PlusIcon className="mr-1.5 h-4 w-4" />
                        Create Scenario
                    </Button>
                </div>

                {/* AI Suggestions */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="h-4 w-4 text-primary" />
                            <h2 className="font-semibold">Suggested for you</h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerate(aiScenarios.length > 0)}
                            disabled={generate.isPending}
                            className="text-muted-foreground"
                        >
                            {generate.isPending
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <RefreshCwIcon className="h-3.5 w-3.5" />
                            }
                            <span className="ml-1.5">{aiScenarios.length === 0 ? "Generate" : "Refresh"}</span>
                        </Button>
                    </div>

                    {aiSuggestions.isLoading && (
                        <div className="flex justify-center py-6">
                            <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
                        </div>
                    )}

                    {!aiSuggestions.isLoading && aiScenarios.length === 0 && (
                        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                            <SparklesIcon className="mx-auto h-6 w-6 mb-2 opacity-40" />
                            <p>No suggestions yet.</p>
                            <p className="mt-1">Click "Generate" to create personalized scenarios based on your vocabulary.</p>
                        </div>
                    )}

                    {aiScenarios.length > 0 && (
                        <div className="grid md:grid-cols-2 gap-3">
                            {aiScenarios.map(s => (
                                <ScenariosListItem key={s.id} data={s} isAiGenerated />
                            ))}
                        </div>
                    )}
                </section>

                {/* User-created scenarios */}
                {userOwned.length > 0 && (
                    <section>
                        <h2 className="font-semibold mb-3">Your Scenarios</h2>
                        <div className="grid md:grid-cols-2 gap-3">
                            {userOwned.map(s => (
                                <ScenariosListItem key={s.id} data={s} isUserCreated onEdit={() => setEditScenario(s)} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Global scenarios */}
                <section>
                    <h2 className="font-semibold mb-3">All Scenarios</h2>
                    {global.length === 0
                        ? <ScenariosEmpty />
                        : (
                            <div className="grid md:grid-cols-2 gap-3">
                                {global.map(s => (
                                    <ScenariosListItem key={s.id} data={s} />
                                ))}
                            </div>
                        )
                    }
                </section>
            </div>
        </>
    )
}
