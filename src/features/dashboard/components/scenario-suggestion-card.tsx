"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {BrainIcon, ChevronRight, SparklesIcon} from "lucide-react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {useSuspenseScenarios} from "@/features/chat/hooks/use-scenarios";
import {useCreateChatFromScenario} from "@/features/chat/hooks/use-chat";
import {useUpgradeModal} from "@/hooks/use-upgrade-modal";
import {useRouter} from "next/navigation";

export default function ScenarioSuggestionCard() {

    // TODO Build dedicated trpc function to fetch exactly suggested scenarios and not the default paginated list
    const scenarios = useSuspenseScenarios()

    const createChat = useCreateChatFromScenario()
    const { handleError, modal } = useUpgradeModal()

    const router = useRouter()

    const handleCreateScenario = (scenarioId: string) => {
        createChat.mutate({
            scenarioId: scenarioId
        }, {
            onSuccess: (chatId) => {
                router.push(`/chat/${chatId}`)
            },
            onError: (error) => {
                handleError(error)
            }
        })
    }

    return <>
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
                    <Link href="/chat" prefetch>
                        <Button variant="ghost" size="sm">
                            Show all
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                    {scenarios.data.items.slice(0, 3).map((scenario) => (
                        <Card
                            key={scenario.id}
                            onClick={() => handleCreateScenario(scenario.id)}
                            className={`h-full group cursor-pointer border transition-all hover:shadow-md bg-chart-2/10 hover:bg-chart-2/20 border-chart-2/30`}
                        >
                            { /* TODO color for a scenario via model in database (above in classname) */ }
                            <CardContent className="p-6 h-full">
                                <div className="space-y-4 flex flex-col justify-between h-full ">
                                    <div className="flex items-start justify-between">
                                        <div className="text-4xl">{scenario.image}</div>
                                        <Badge variant="outline" className="text-xs">
                                            { /* TODO Difficulty (e.g. A1, A2, ...) for scenario */ }
                                            Beginner
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="font-bold text-lg leading-tight text-balance">{scenario.title}</h3>
                                        <p className="overflow-y-auto max-h-[150] text-sm text-muted-foreground leading-relaxed text-pretty">
                                            {scenario.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <BrainIcon className="h-3.5 w-3.5" />
                                            { /* TODO Amount of vocabulary in scenario */ }
                                            <span>12 Words from vocabulary</span>
                                        </div>
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
            </CardContent>
        </Card>
    </>
}