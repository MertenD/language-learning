"use client"

import Link from "next/link"
import {ChevronRightIcon, HistoryIcon, TargetIcon, Trash2Icon} from "lucide-react"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {useScenarioSessions, useRemoveSession} from "@/features/scenarios/hooks/use-scenario-sessions"

function formatDate(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return date.toLocaleTimeString("de-DE", {hour: "2-digit", minute: "2-digit"})
    if (days === 1) return "Gestern"
    if (days < 7) return date.toLocaleDateString("de-DE", {weekday: "short"})
    return date.toLocaleDateString("de-DE", {day: "2-digit", month: "2-digit"})
}

export default function PastSessionsSection() {
    const {data, isLoading} = useScenarioSessions()
    const removeSession = useRemoveSession()

    const sessions = data?.items ?? []

    if (isLoading || sessions.length === 0) return null

    return (
        <section>
            <div className="flex items-center gap-2 mb-3">
                <HistoryIcon className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold">Weitermachen</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
                {sessions.map(session => {
                    const done = session.targetsStatus.filter(Boolean).length
                    const total = session.targetsStatus.length
                    const isCompleted = total > 0 && done === total

                    return (
                        <Link key={session.id} href={`/scenarios/${session.id}`} className="block group">
                            <div className="flex items-start gap-4 rounded-xl border bg-card p-4 hover:bg-accent/40 transition-colors">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl mt-0.5">
                                    {session.scenario.image}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold text-sm leading-snug truncate">
                                            {session.title ?? session.scenario.title}
                                        </h3>
                                        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                                            {formatDate(new Date(session.updatedAt))}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        {session.scenario.level && (
                                            <Badge variant="outline" className="text-xs py-0 px-1.5 font-mono">
                                                {session.scenario.level}
                                            </Badge>
                                        )}
                                        {total > 0 && (
                                            isCompleted ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                                    <TargetIcon className="size-3" />
                                                    Abgeschlossen
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                    <TargetIcon className="size-3" />
                                                    {done}/{total} Ziele
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0" onClick={e => e.preventDefault()}>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                                disabled={removeSession.isPending}
                                            >
                                                <Trash2Icon className="size-3.5" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Session löschen?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Der Chatverlauf dieser Session wird dauerhaft gelöscht.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => removeSession.mutate({id: session.id})}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Löschen
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <ChevronRightIcon className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}
