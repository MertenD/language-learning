"use client"

import React, { Suspense, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, BookOpenTextIcon, NotebookPenIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WordCreateDialog } from "@/features/words/components/word-create-dialog"
import { GrammarCreateDialog } from "@/features/grammar/components/grammar-create-dialog"
import { useCreateWord } from "@/features/words/hooks/use-words"
import { useCreateGrammar } from "@/features/grammar/hooks/use-grammar"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"

interface ChatHeaderProps {
    assistantName: string
    isLoading: boolean
    chatHeaderTail?: React.ReactNode
}

export function ChatHeader({ assistantName, isLoading, chatHeaderTail }: ChatHeaderProps) {
    const [wordDialogOpen, setWordDialogOpen] = useState(false)
    const [grammarDialogOpen, setGrammarDialogOpen] = useState(false)

    const createWord = useCreateWord()
    const createGrammar = useCreateGrammar()
    const { handleError, modal } = useUpgradeModal()

    return (
        <>
            {modal}
            <div className="flex justify-between items-center gap-3 border-b bg-gradient-to-r from-background to-muted/30 backdrop-blur-sm p-5 shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 shadow-md border-2 border-white dark:border-slate-800">
                        <AvatarImage src="/ai-assistant-concept.png" />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80">
                            <Bot className="h-5 w-5 text-white" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-semibold text-lg">{assistantName}</h2>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${isLoading ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                            {isLoading ? "Antwort wird generiert..." : "Online"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setWordDialogOpen(true)}
                    >
                        <BookOpenTextIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Vokabel</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setGrammarDialogOpen(true)}
                    >
                        <NotebookPenIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Grammatik</span>
                    </Button>
                    {chatHeaderTail}
                </div>
            </div>

            <Suspense>
                <WordCreateDialog
                    open={wordDialogOpen}
                    onOpenChange={setWordDialogOpen}
                    onCreate={(data) => {
                        createWord.mutate(data, {
                            onSuccess: () => setWordDialogOpen(false),
                            onError: handleError,
                        })
                    }}
                />
            </Suspense>

            <GrammarCreateDialog
                open={grammarDialogOpen}
                onOpenChange={setGrammarDialogOpen}
                onCreate={(data) => {
                    createGrammar.mutate(data, {
                        onSuccess: () => setGrammarDialogOpen(false),
                        onError: handleError,
                    })
                }}
            />
        </>
    )
}
