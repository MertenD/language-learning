"use client"

import type { Chat } from "@/generated/prisma/client"
import { useRemoveChat } from "@/features/chat/hooks/use-chat"
import { CheckCircle2Icon, MessageSquareIcon, MoreVerticalIcon, TargetIcon, TrashIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type MsgPart = { type: string; text?: string }
type Msg = { role: string; parts?: MsgPart[] }

function getLastUserMessage(messages: unknown): string | null {
    if (!Array.isArray(messages)) return null
    const msg = [...(messages as Msg[])].reverse().find(m => m.role === "user")
    return msg?.parts?.find(p => p.type === "text")?.text?.trim() ?? null
}

function getUserMessageCount(messages: unknown): number {
    if (!Array.isArray(messages)) return 0
    return (messages as Msg[]).filter(m => m.role === "user").length
}

function formatDate(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
    if (days === 1) return "Yesterday"
    if (days < 7) return date.toLocaleDateString("de-DE", { weekday: "short" })
    return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })
}

export default function ChatsListItem({ data }: { data: Chat }) {
    const removeChat = useRemoveChat()
    const preview = getLastUserMessage(data.messages)
    const messageCount = getUserMessageCount(data.messages)

    const isScenario = !!data.scenarioId
    const totalTargets = data.targetsStatus?.length ?? 0
    const doneTargets = data.targetsStatus?.filter(Boolean).length ?? 0
    const isCompleted = isScenario && totalTargets > 0 && doneTargets === totalTargets

    return (
        <Link href={`/chat/${data.id}`} className="block group">
            <div className={cn(
                "flex items-start gap-3 rounded-xl border bg-card px-4 py-3 hover:bg-accent/50 transition-colors",
                removeChat.isPending && "opacity-50 pointer-events-none"
            )}>
                {/* Icon */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-lg mt-0.5">
                    {data.assistantIcon ?? <MessageSquareIcon className="size-4 text-muted-foreground" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-semibold text-sm truncate">{data.title || "New Chat"}</h3>
                        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                            {formatDate(new Date(data.updatedAt))}
                        </span>
                    </div>
                    {data.assistantName && (
                        <p className="text-xs text-muted-foreground mt-0.5">{data.assistantName}</p>
                    )}
                    {preview ? (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{preview}</p>
                    ) : (
                        <p className="text-sm text-muted-foreground/50 mt-1 italic">No messages yet</p>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {messageCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <MessageSquareIcon className="size-3" />
                                {messageCount}
                            </span>
                        )}
                        {isScenario && totalTargets > 0 && (
                            isCompleted ? (
                                <Badge variant="secondary" className="gap-1 py-0 px-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                                    <CheckCircle2Icon className="size-3" />
                                    Abgeschlossen
                                </Badge>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                    <TargetIcon className="size-3" />
                                    {doneTargets}/{totalTargets} Ziele
                                </span>
                            )
                        )}
                    </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity -mr-1 mt-0.5"
                            onClick={e => { e.preventDefault(); e.stopPropagation() }}
                            disabled={removeChat.isPending}
                        >
                            <MoreVerticalIcon className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        onClick={e => { e.preventDefault(); e.stopPropagation() }}
                    >
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => removeChat.mutate({ id: data.id })}
                            disabled={removeChat.isPending}
                        >
                            <TrashIcon className="size-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </Link>
    )
}
