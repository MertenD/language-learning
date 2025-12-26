"use client"

import type React from "react"
import {useEffect, useRef, useState} from "react"
import {useChat} from "@ai-sdk/react"
import {DefaultChatTransport, type UIMessage} from "ai"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Button} from "@/components/ui/button"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Bot, Send} from "lucide-react"
import MessageBubbleUser from "@/features/chat/components/chat/message-bubble-user";
import {Textarea} from "@/components/ui/textarea";
import MessageBubbleAi from "@/features/chat/components/chat/message-bubble-ai";
import {getTextFromMessage} from "@/features/chat/utils/chat-utils";
import parseChatAiAnswer from "@/features/chat/utils/prompts-utils";

type Props = {
    chatId: string
    assistantName?: string
    initialMessages: UIMessage[]
    onTargetsStatusChange?: (targetsStatus: boolean[]) => void
}

export function ChatInterface({ chatId, assistantName, initialMessages, onTargetsStatusChange }: Props) {
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const [input, setInput] = useState("")
    const [isOneMessageSent, setIsOneMessageSent] = useState(false)

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
        if (isOneMessageSent && !isLoading && messages[messages.length - 1]?.role === "assistant" && onTargetsStatusChange) {
            const lastAssistantMessage = messages[messages.length - 1]
            const text = getTextFromMessage(lastAssistantMessage)
            const { targetsStatus } = parseChatAiAnswer(text)
            if (targetsStatus) {
                onTargetsStatusChange(targetsStatus)
            }
        }
    }, [messages, isLoading])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return
        sendMessage({ text: input })
        setInput("")
        setIsOneMessageSent(true)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e as unknown as React.FormEvent)
        }
    }

    return <div className="flex h-full w-full flex-col overflow-hidden">
            <div className="flex items-center gap-3 border-b bg-muted/50 p-4 shrink-0">
                <Avatar>
                    <AvatarImage src="/ai-assistant-concept.png" />
                    <AvatarFallback>
                        <Bot className="h-5 w-5" />
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="font-semibold text-lg">{assistantName || "Assistant"}</h2>
                    <p className="text-sm text-muted-foreground">
                        {isLoading ? "Antwort wird generiert..." : "Online"}
                    </p>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ScrollArea ref={scrollAreaRef} className="h-full">
                    <div className="space-y-4 p-4 max-w-5xl mx-auto">
                        {messages
                            .filter((message) => message.role === "user" || message.role === "assistant")
                            .map((message) => {
                                const text = getTextFromMessage(message)

                                const isUser = message.role === "user"
                                const isLastAssistant = !isUser && message.id === messages[messages.length - 1]?.id

                                if (isUser) {
                                    return <MessageBubbleUser key={message.id} text={text}/>
                                } else {
                                    return <MessageBubbleAi
                                        key={message.id}
                                        text={text}
                                        isStreaming={isLastAssistant && isLoading}
                                    />
                                }
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
                    <Textarea
                        placeholder="Schreibe eine Nachricht..."
                        value={input}
                        rows={Math.min(5, input.split("\n").length)}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        className="flex-1 bg-background"
                    />
                    <Button type="submit" disabled={!input.trim() || isLoading} size="icon">
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Nachricht senden</span>
                    </Button>
                </form>
            </div>
    </div>
}
