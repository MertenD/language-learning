"use client"

import type React from "react"
import {useEffect, useRef, useState} from "react"
import {useChat} from "@ai-sdk/react"
import {DefaultChatTransport, type UIMessage} from "ai"
import {Avatar, AvatarFallback} from "@/components/ui/avatar"
import {ScrollArea} from "@/components/ui/scroll-area"
import MessageBubbleUser from "@/features/chat/components/chat/message-bubble-user";
import MessageBubbleAi from "@/features/chat/components/chat/message-bubble-ai";
import {getTextFromMessage} from "@/features/chat/utils/chat-utils";
import parseChatAiAnswer from "@/features/chat/utils/prompts-utils";
import {ChatHeader} from "@/features/chat/components/chat/chat-header";
import {Bot} from "lucide-react";
import {ChatInput} from "@/features/chat/components/chat/chat-input";

type ChatInterfaceProps = {
    chatId: string
    assistantName?: string
    initialMessages: UIMessage[]
    onTargetsStatusChange?: (targetsStatus: boolean[]) => void
}

export function ChatInterface({ chatId, assistantName, initialMessages, onTargetsStatusChange }: ChatInterfaceProps) {
    const scrollAreaRef = useRef<HTMLDivElement>(null)
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

    const handleSendMessage = (text: string) => {
        sendMessage({ text })
        setIsOneMessageSent(true)
    }

    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            <ChatHeader assistantName={assistantName || "Assistant"} isLoading={isLoading} />

            <div className="flex-1 min-h-0">
                <ScrollArea ref={scrollAreaRef} className="h-full">
                    <div className="space-y-6 p-6 max-w-5xl mx-auto">
                        {messages
                            .filter((message) => message.role === "user" || message.role === "assistant")
                            .map((message) => {
                                const text = getTextFromMessage(message)

                                const isUser = message.role === "user"
                                const isLastAssistant = !isUser && message.id === messages[messages.length - 1]?.id

                                if (isUser) {
                                    return <MessageBubbleUser key={message.id} text={text} />
                                } else {
                                    return (
                                        <MessageBubbleAi
                                            key={message.id}
                                            text={text}
                                            isStreaming={isLastAssistant && isLoading}
                                            onExampleClick={handleSendMessage}
                                        />
                                    )
                                }
                            })}

                        {isLoading && (
                            <div className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-500">
                                { status !== "streaming" ? <Avatar className="h-9 w-9 shadow-sm border-2 border-white dark:border-slate-800">
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80">
                                        <Bot className="h-4 w-4 text-white" />
                                    </AvatarFallback>
                                </Avatar> : <div className="h-9 w-9" /> }
                                <div className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm px-5 py-4">
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-gradient-to-br from-primary to-primary/80 [animation-delay:-0.3s]" />
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-gradient-to-br from-primary to-primary/80 [animation-delay:-0.15s]" />
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-gradient-to-br from-primary to-primary/80" />
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 px-4 py-3">
                                <p className="text-sm text-rose-700 dark:text-rose-300">
                                    {error.message === "Payment required"
                                        ? "Für diesen Chat benötigst du ein aktives Premium-Abo."
                                        : "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut."}
                                </p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
    )
}
