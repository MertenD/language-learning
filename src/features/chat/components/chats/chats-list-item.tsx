"use client"

import type { Chat } from "@/generated/prisma/client"
import React from "react"
import { useRemoveChat } from "@/features/chat/hooks/use-chat"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, MoreVerticalIcon, TrashIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

type MsgPart = { type: string; text?: string }
type Msg = { role: string; parts?: MsgPart[] }

function getLastUserMessage(messages: unknown): string | null {
    if (!Array.isArray(messages)) return null
    const msg = [...(messages as Msg[])].reverse().find(m => m.role === "user")
    return msg?.parts?.find(p => p.type === "text")?.text?.trim() ?? null
}

export default function ChatsListItem({ data }: { data: Chat }) {
    const removeChat = useRemoveChat()
    const preview = getLastUserMessage(data.messages)

    return (
        <Link href={`/chat/${data.id}`}>
            <Card className={cn(
                "shadow-none hover:shadow cursor-pointer transition-shadow",
                removeChat.isPending && "opacity-50 cursor-not-allowed"
            )}>
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-lg">
                                {data.assistantIcon ?? <MessageSquare className="size-4 text-primary-foreground" />}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                                <h3 className="font-semibold text-foreground truncate">{data.title || "New Chat"}</h3>
                                <span className="text-xs text-muted-foreground shrink-0">
                                    {new Date(data.updatedAt).toLocaleDateString("de-DE")}
                                </span>
                            </div>
                            {data.assistantName && (
                                <p className="text-xs text-muted-foreground mt-0.5">{data.assistantName}</p>
                            )}
                            {preview && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                    {preview}
                                </p>
                            )}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 shrink-0 -mr-1"
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
                                    onClick={() => removeChat.mutate({ id: data.id })}
                                    disabled={removeChat.isPending}
                                >
                                    <TrashIcon className="size-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
