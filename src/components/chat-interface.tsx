"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, User, Bot } from "lucide-react"

type Message = {
    id: string
    content: string
    role: "user" | "assistant"
    timestamp: Date
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            content: "Hallo! Wie kann ich dir heute helfen?",
            role: "assistant",
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight
            }
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            content: input,
            role: "user",
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        setTimeout(() => {
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: "Das ist eine simulierte Antwort. Integriere hier deine eigene KI-Logik!",
                role: "assistant",
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, assistantMessage])
            setIsLoading(false)
        }, 1000)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <Card className="flex w-full max-w-2xl flex-col h-[600px] shadow-lg overflow-hidden">
            <div className="flex items-center gap-3 border-b bg-muted/50 p-4 shrink-0">
                <Avatar>
                    <AvatarImage src="/ai-assistant-concept.png" />
                    <AvatarFallback>
                        <Bot className="h-5 w-5" />
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="font-semibold text-lg">Chat Assistent</h2>
                    <p className="text-sm text-muted-foreground">Online</p>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ScrollArea ref={scrollAreaRef} className="h-full">
                    <div className="space-y-4 p-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                            >
                                <Avatar className="h-8 w-8">
                                    {message.role === "user" ? (
                                        <>
                                            <AvatarImage src="/diverse-user-avatars.png" />
                                            <AvatarFallback>
                                                <User className="h-4 w-4" />
                                            </AvatarFallback>
                                        </>
                                    ) : (
                                        <>
                                            <AvatarImage src="/ai-assistant-concept.png" />
                                            <AvatarFallback>
                                                <Bot className="h-4 w-4" />
                                            </AvatarFallback>
                                        </>
                                    )}
                                </Avatar>
                                <div
                                    className={`flex max-w-[75%] flex-col gap-1 ${message.role === "user" ? "items-end" : "items-start"}`}
                                >
                                    <div
                                        className={`rounded-lg px-4 py-2 ${
                                            message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                        }`}
                                    >
                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                  </span>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                        <Bot className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex items-center gap-1 rounded-lg bg-muted px-4 py-2">
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/60 [animation-delay:-0.3s]" />
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/60 [animation-delay:-0.15s]" />
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/60" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            <div className="border-t p-4 shrink-0">
                <div className="flex gap-2">
                    <Input
                        placeholder="Schreibe eine Nachricht..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon">
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Nachricht senden</span>
                    </Button>
                </div>
            </div>
        </Card>
    )
}
