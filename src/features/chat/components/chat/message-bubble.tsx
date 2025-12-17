import {useSmoothText} from "@/features/chat/hooks/use-scmooth-text";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {BotIcon, UserIcon} from "lucide-react";
import {MarkdownContent} from "@/components/markdown-content";

export default function MessageBubble({
   text,
   isUser,
   isStreaming
}: {
    text: string
    isUser: boolean
    isStreaming: boolean
}) {
    const displayedText = useSmoothText(text, isStreaming, 1)

    const conversation = displayedText.match(
        /<CONVERSATION>([\s\S]*?)<\/CONVERSATION>/,
    )?.[1]?.trim()

    const explanation = displayedText.match(
        /<EXPLANATION>([\s\S]*?)<\/EXPLANATION>/,
    )?.[1]?.trim()

    const exampleAnswers = displayedText.match(
        /<EXAMPLE_ANSWERS>([\s\S]*?)<\/EXAMPLE_ANSWERS>/,
    )?.[1]?.trim()

    const mistakes = displayedText.match(
        /<MISTAKES>([\s\S]*?)<\/MISTAKES>/,
    )?.[1]?.trim()

    function renderBubble(content: string, backgroundColor?: string) {
        return <div
            className={`flex max-w-[75%] flex-col gap-1 ${
                isUser ? "items-end" : "items-start"
            }`}
        >
            <div
                className={`rounded-lg px-4 py-2 w-full overflow-x-auto ${
                    backgroundColor ? backgroundColor : isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-card"
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
            className={`flex gap-3 ${
                isUser ? "flex-row-reverse" : "flex-row"
            }`}
        >
            <Avatar className="h-8 w-8">
                {isUser ? (
                    <>
                        <AvatarImage src="/diverse-user-avatars.png"/>
                        <AvatarFallback>
                            <UserIcon className="h-4 w-4"/>
                        </AvatarFallback>
                    </>
                ) : (
                    <>
                    <AvatarImage src="/ai-assistant-concept.png" />
                        <AvatarFallback>
                            <BotIcon className="h-4 w-4" />
                        </AvatarFallback>
                    </>
                )}
            </Avatar>
            { !conversation && renderBubble(displayedText) }
            <div className="flex flex-col max-w-4xl gap-2">
                { conversation && mistakes && renderBubble(mistakes, "bg-red-100") }
                { conversation && renderBubble(conversation) }
                { conversation && explanation && renderBubble(explanation, "bg-yellow-100") }
                { conversation && exampleAnswers && renderBubble(exampleAnswers, "bg-green-100") }
            </div>
        </div>
    )
}
