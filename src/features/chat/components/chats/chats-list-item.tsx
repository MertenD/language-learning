"use client"

import {Chat} from "@/generated/prisma/client";
import React from "react";
import {useRemoveChat} from "@/features/chat/hooks/use-chat";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {BookOpenTextIcon, MessageSquare, MoreVerticalIcon, TrashIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import Link from "next/link";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";

export default function ChatsListItem({ data }: { data: Chat }) {
    const removeChat = useRemoveChat()

    const handleRemove = () => {
        removeChat.mutate({ id: data.id })
    }

    return <Link href={`/chat/${data.id}`}>
        <Card
            className={cn(
                "p-2 shadow-none hover:shadow cursor-pointer transition-shadow px-0",
                removeChat.isPending && "opacity-50 cursor-not-allowed"
            )}
        >
            <CardContent className="px-2">
                <div className="flex items-start gap-4 p-2">
                    <div className="flex-shrink-0 mt-1">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
                            { data.assistantIcon ? data.assistantIcon : <MessageSquare className="size-5 text-white" /> }
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground text-balance">{data.title || "Unbenannter Chat"}</h3>
                        <p className="text-xs text-muted-foreground">
                            {new Date(data.createdAt).toLocaleDateString("de-DE")}
                        </p>
                    </div>

                    <div className="flex gap-x-2 items-center ml-4 flex-shrink-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                    }}
                                    disabled={removeChat.isPending}
                                >
                                    <MoreVerticalIcon className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                }}
                            >
                                <DropdownMenuItem onClick={handleRemove} disabled={removeChat.isPending}>
                                    <TrashIcon className="size-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    </Link>
}
