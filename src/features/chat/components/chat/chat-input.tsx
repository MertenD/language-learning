"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

interface ChatInputProps {
    onSend: (message: string) => void
    disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [input, setInput] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || disabled) return
        onSend(input)
        setInput("")
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e as unknown as React.FormEvent)
        }
    }

    return (
        <div className="border-t bg-background/80 backdrop-blur-sm p-5 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <form className="flex gap-3 max-w-4xl mx-auto" onSubmit={handleSubmit}>
                <Textarea
                    placeholder="Schreibe eine Nachricht..."
                    value={input}
                    rows={Math.min(5, input.split("\n").length)}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    className="flex-1 bg-background rounded-xl border-slate-300 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-primary/50 resize-none shadow-sm"
                />
                <Button
                    type="submit"
                    disabled={!input.trim() || disabled}
                    size="icon"
                    className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md hover:shadow-lg transition-all duration-200"
                >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Nachricht senden</span>
                </Button>
            </form>
        </div>
    )
}
