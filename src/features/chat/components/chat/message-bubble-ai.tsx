import {useSmoothText} from "@/features/chat/hooks/use-scmooth-text";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {BotIcon} from "lucide-react";
import {MarkdownContent} from "@/components/markdown-content";
import parseChatAiAnswer from "@/features/chat/utils/prompts-utils";

export default function MessageBubbleAi({
  text,
  isStreaming
}: {
    text: string
    isStreaming: boolean
}) {
    const displayedText = useSmoothText(text, isStreaming, 1)

    const chatAiAnswer = parseChatAiAnswer(displayedText)

    function renderBubble(content: string, backgroundColor?: string) {
        return <div
            className={`flex max-w-[75%] flex-col gap-1 items-start`}
        >
            <div
                className={`rounded-lg px-4 py-2 w-full overflow-x-auto ${
                    backgroundColor ? backgroundColor : "bg-card"
                }`}
            >
                <p className="text-sm">
                    <MarkdownContent content={content}/>
                </p>
            </div>
        </div>
    }

    return (
        <div
            className={`flex gap-3 lex-row`}
        >
            <Avatar className="h-8 w-8">
                <AvatarImage src="/ai-assistant-concept.png" />
                <AvatarFallback>
                    <BotIcon className="h-4 w-4" />
                </AvatarFallback>
            </Avatar>
            { !chatAiAnswer.conversation && !chatAiAnswer.explanation && renderBubble(displayedText) }
            <div className="flex flex-col max-w-4xl gap-2">
                { chatAiAnswer.conversation && renderBubble(chatAiAnswer.conversation) }
                { chatAiAnswer.explanation && renderBubble(chatAiAnswer.explanation, "bg-yellow-100") }
                { chatAiAnswer.conversation && chatAiAnswer.mistakes && renderBubble(chatAiAnswer.mistakes, "bg-red-100") }
                { chatAiAnswer.conversation && chatAiAnswer.exampleAnswers && renderBubble(chatAiAnswer.exampleAnswers, "bg-green-100") }
            </div>
        </div>
    )
}
