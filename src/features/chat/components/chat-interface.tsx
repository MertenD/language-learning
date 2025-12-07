"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, User, Bot } from "lucide-react"
import MessageBubble from "@/features/chat/components/message-bubble";

type Props = {
    chatId: string
    initialMessages: UIMessage[]
}

export function ChatInterface({ chatId, initialMessages }: Props) {
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const [input, setInput] = useState("")

    const { messages, sendMessage, status, error } = useChat({
        id: chatId,
        messages: initialMessages,
        resume: true,
        transport: new DefaultChatTransport({
            api: "/api/chat",
            // only send the latest message, the server will reconstruct the full history
            prepareSendMessagesRequest: ({ messages, id }) => ({
                body: {
                    id,
                    message: messages[messages.length - 1],
                },
            }),
        }),
    })

    const isLoading = status === "streaming" || status === "submitted"

    const scrollToBottom = () => {
        if (!scrollAreaRef.current) return
        const viewport = scrollAreaRef.current.querySelector(
            "[data-radix-scroll-area-viewport]",
        ) as HTMLDivElement | null
        if (!viewport) return
        viewport.scrollTop = viewport.scrollHeight
    }

    useEffect(() => {
        scrollToBottom()
        console.log("messages", messages)
    }, [messages, isLoading])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return
        sendMessage({ text: input })
        setInput("")
    }

    return (
        <Card className="flex h-full w-full flex-col shadow-lg overflow-hidden">
            <div className="flex items-center gap-3 border-b bg-muted/50 p-4 shrink-0">
                <Avatar>
                    <AvatarImage src="/ai-assistant-concept.png" />
                    <AvatarFallback>
                        <Bot className="h-5 w-5" />
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="font-semibold text-lg">Chat Assistent</h2>
                    <p className="text-sm text-muted-foreground">
                        {isLoading ? "Antwort wird generiert..." : "Online"}
                    </p>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ScrollArea ref={scrollAreaRef} className="h-full">
                    <div className="space-y-4 p-4 max-w-5xl mx-auto">
                        {messages
                            .filter((m) => m.role === "user" || m.role === "assistant")
                            .map((m) => {
                                const text =
                                    m.parts
                                        ?.map((p) => (p.type === "text" ? p.text : ""))
                                        .join("") ?? ""

                                const isUser = m.role === "user"
                                const isLastAssistant = !isUser && m.id === messages[messages.length - 1]?.id

                                return (
                                    <MessageBubble
                                        key={m.id}
                                        text={text}
                                        isUser={isUser}
                                        isStreaming={isLastAssistant && isLoading}
                                    />
                                )
                            })}


                        {isLoading && (
                            <div className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                        <Bot className="h-4 w-4"/>
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex items-center gap-1 rounded-lg bg-muted px-4 py-2">
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/60 [animation-delay:-0.3s]" />
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/60 [animation-delay:-0.15s]" />
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/60" />
                                </div>
                            </div>
                        )}

                        {error && (
                            <p className="text-xs text-red-500">
                                {error.message === "Payment required"
                                    ? "Für diesen Chat benötigst du ein aktives Premium-Abo."
                                    : "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut."}
                            </p>
                        )}
                    </div>
                </ScrollArea>
            </div>

            <div className="border-t p-4 shrink-0">
                <form className="flex gap-2 max-w-4xl mx-auto" onSubmit={handleSubmit}>
                    <Input
                        placeholder="Schreibe eine Nachricht..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={!input.trim() || isLoading} size="icon">
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Nachricht senden</span>
                    </Button>
                </form>
            </div>
        </Card>
    )
}
