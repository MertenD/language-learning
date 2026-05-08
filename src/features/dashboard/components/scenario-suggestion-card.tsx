"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Loader2, RefreshCwIcon, SparklesIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAiSuggestions, useGenerateScenarios } from "@/features/chat/hooks/use-scenarios"
import { useCreateChatFromScenario } from "@/features/chat/hooks/use-chat"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"
import { useRouter } from "next/navigation"

export default function ScenarioSuggestionCard() {
    const { data: suggestions, isLoading } = useAiSuggestions()
    const generateScenarios = useGenerateScenarios()
    const createChat = useCreateChatFromScenario()
    const { handleError, modal } = useUpgradeModal()
    const router = useRouter()

    const handleCreateScenario = (scenarioId: string) => {
        createChat.mutate({ scenarioId }, {
            onSuccess: (chatId) => router.push(`/chat/${chatId}`),
            onError: handleError,
        })
    }

    const handleGenerate = (force = false) => {
        generateScenarios.mutate({ force }, { onError: handleError })
    }

    const items = suggestions?.slice(0, 3) ?? []

    return (
        <>
            {modal}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-2xl">Suggested Scenarios</CardTitle>
                                <Badge variant="secondary" className="gap-1">
                                    <SparklesIcon className="h-3 w-3" />
                                    AI generated
                                </Badge>
                            </div>
                            <CardDescription>Based on your recently learned vocabulary.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {items.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleGenerate(true)}
                                    disabled={generateScenarios.isPending}
                                >
                                    {generateScenarios.isPending
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : <RefreshCwIcon className="h-4 w-4" />
                                    }
                                </Button>
                            )}
                            <Link href="/chat?tab=scenarios" prefetch>
                                <Button variant="ghost" size="sm">
                                    Show all
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center text-center py-10 gap-4">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                                <SparklesIcon className="size-6 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-medium">No suggestions yet</p>
                                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                                    Generate AI scenarios tailored to your vocabulary and learning progress.
                                </p>
                            </div>
                            <Button
                                onClick={() => handleGenerate(false)}
                                disabled={generateScenarios.isPending}
                            >
                                {generateScenarios.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Generate Scenarios
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-3">
                            {items.map((scenario) => (
                                <Card
                                    key={scenario.id}
                                    onClick={() => handleCreateScenario(scenario.id)}
                                    className="h-full group cursor-pointer border transition-all hover:shadow-md bg-chart-2/10 hover:bg-chart-2/20 border-chart-2/30"
                                >
                                    <CardContent className="p-6 h-full">
                                        <div className="space-y-4 flex flex-col justify-between h-full">
                                            <div className="flex items-start justify-between">
                                                <div className="text-4xl">{scenario.image}</div>
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="font-bold text-lg leading-tight text-balance">{scenario.title}</h3>
                                                <p className="text-sm text-muted-foreground leading-relaxed text-pretty line-clamp-3">
                                                    {scenario.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-end pt-2">
                                                <Button size="sm" variant="ghost" className="gap-1 group-hover:gap-2 transition-all">
                                                    Start
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    )
}