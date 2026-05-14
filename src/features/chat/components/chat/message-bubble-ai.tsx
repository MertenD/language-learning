"use client"

import { useSmoothText } from "@/features/chat/hooks/use-scmooth-text"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BotIcon } from "lucide-react"
import parseChatAiAnswer from "@/features/chat/utils/prompts-utils"
import { MessageSection } from "@/features/chat/components/chat/message-section"
import { ExampleAnswersSection } from "@/features/chat/components/chat/example-answers-section"

interface MessageBubbleAiProps {
    text: string
    isStreaming: boolean
    onExampleClick?: (text: string) => void
}

export default function MessageBubbleAi({ text, isStreaming, onExampleClick }: MessageBubbleAiProps) {
    const displayedText = useSmoothText(text, isStreaming, 1)
    const chatAiAnswer = parseChatAiAnswer(displayedText)

    return <div className="flex flex-col">
        {chatAiAnswer.mistakes && <div className="mt-[-13px] pb-2 flex gap-3 flex-row-reverse animate-in fade-in slide-in-from-right-2 duration-500 mb-4">
            <div className="h-9 w-9"/>
            <MessageSection markdownContent={chatAiAnswer.mistakes} variant="mistakes" isCollapsible />
        </div>}
        <div className="flex gap-3 flex-row animate-in fade-in slide-in-from-left-2 duration-500">
            <Avatar className="h-9 w-9 shadow-sm border-2 border-card">
                <AvatarImage src="/ai-assistant-concept.png" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80">
                    <BotIcon className="h-4 w-4 text-primary-foreground" />
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col max-w-4xl gap-3 items-start">
                {chatAiAnswer.conversation && (
                    <div className="inline-block w-fit max-w-full">
                        <MessageSection markdownContent={chatAiAnswer.conversation} />
                    </div>
                )}
                {chatAiAnswer.explanation && <MessageSection markdownContent={chatAiAnswer.explanation} variant="explanation" isCollapsible />}
                {chatAiAnswer.exampleAnswers && (
                    <ExampleAnswersSection content={chatAiAnswer.exampleAnswers} onExampleClick={onExampleClick} />
                )}
                {!chatAiAnswer.conversation &&
                    !chatAiAnswer.explanation &&
                    !chatAiAnswer.mistakes &&
                    !chatAiAnswer.exampleAnswers && <MessageSection markdownContent={displayedText} />}
            </div>
        </div>
    </div>
}
