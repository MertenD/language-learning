"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useCreateChatFromScenario } from "@/features/chat/hooks/use-chat"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"
import { useRemoveUserScenario } from "@/features/chat/hooks/use-scenarios"
import { ChevronRightIcon, Loader2Icon, MoreVerticalIcon, PencilIcon, SparklesIcon, Trash2Icon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Scenario } from "@/generated/prisma/client"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ScenariosListItemProps {
    data: Scenario
    isAiGenerated?: boolean
    isUserCreated?: boolean
    onEdit?: () => void
}

export default function ScenariosListItem({ data, isAiGenerated, isUserCreated, onEdit }: ScenariosListItemProps) {
    const createChat = useCreateChatFromScenario()
    const removeScenario = useRemoveUserScenario()
    const { handleError, modal } = useUpgradeModal()
    const router = useRouter()

    const handleCreateChat = () => {
        createChat.mutate({ scenarioId: data.id }, {
            onSuccess: (chatId) => router.push(`/chat/${chatId}`),
            onError: handleError,
        })
    }

    const isPending = createChat.isPending

    return (
        <>
            {modal}
            <div
                className={cn(
                    "group flex items-start gap-4 rounded-xl border bg-card p-4 hover:bg-accent/40 transition-colors cursor-pointer",
                    isPending && "opacity-50 pointer-events-none"
                )}
                onClick={handleCreateChat}
            >
                {/* Emoji icon */}
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl mt-0.5">
                    {data.image}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <h3 className="font-semibold text-sm leading-snug">{data.title}</h3>
                            {isAiGenerated && (
                                <Badge variant="secondary" className="gap-1 shrink-0 text-xs py-0">
                                    <SparklesIcon className="h-3 w-3" />
                                    Suggested
                                </Badge>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                            {isPending && <Loader2Icon className="size-4 animate-spin text-muted-foreground" />}
                            {isUserCreated && (
                                <AlertDialog>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <MoreVerticalIcon className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {onEdit && (
                                                <>
                                                    <DropdownMenuItem onClick={onEdit}>
                                                        <PencilIcon className="size-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                </>
                                            )}
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                    <Trash2Icon className="size-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete "{data.title}"?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This scenario will be permanently deleted.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => removeScenario.mutate({ id: data.id })}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {data.description}
                    </p>
                </div>

                {/* Arrow */}
                <ChevronRightIcon className="size-4 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
        </>
    )
}
