"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useCreateChatFromScenario } from "@/features/chat/hooks/use-chat"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"
import { useRemoveUserScenario } from "@/features/chat/hooks/use-scenarios"
import { PencilIcon, SparklesIcon, Trash2Icon } from "lucide-react"
import type { Scenario } from "@/generated/prisma/client"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
            <Card
                className={cn(
                    "p-2 shadow-none hover:shadow cursor-pointer transition-shadow px-0 relative",
                    isPending && "opacity-50 cursor-not-allowed"
                )}
            >
                {/* Badges top-right */}
                <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                    {isAiGenerated && (
                        <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                            <SparklesIcon className="h-3 w-3" />
                            Suggested
                        </span>
                    )}
                    {isUserCreated && onEdit && (
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={e => { e.stopPropagation(); onEdit() }}
                            >
                                <PencilIcon className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={e => e.stopPropagation()}
                                        disabled={removeScenario.isPending}
                                    >
                                        <Trash2Icon className="h-3.5 w-3.5" />
                                    </Button>
                                </AlertDialogTrigger>
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
                        </div>
                    )}
                </div>

                <button
                    disabled={isPending}
                    onClick={handleCreateChat}
                    className="w-full text-left"
                >
                    <CardContent className="px-2">
                        <div className="flex items-start gap-4 p-2">
                            <div className="flex-shrink-0 mt-1">
                                <div className="flex size-16 items-center justify-center rounded-lg bg-primary/10 text-3xl">
                                    {data.image}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 pr-16">
                                <h3 className="text-lg font-semibold text-foreground text-balance">{data.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {data.description}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </button>
            </Card>
        </>
    )
}
