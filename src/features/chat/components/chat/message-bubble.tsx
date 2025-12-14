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
    const displayedText = useSmoothText(text, isStreaming ? 1 : 0)

    return (
        <div
            className={`flex gap-3 ${
                isUser ? "flex-row-reverse" : "flex-row"
            }`}
        >
            <Avatar className="h-8 w-8">
                {isUser ? (
                    <>
                        <AvatarImage src="/diverse-user-avatars.png" />
                        <AvatarFallback>
                            <UserIcon className="h-4 w-4" />
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
            <div
                className={`flex max-w-[75%] flex-col gap-1 ${
                    isUser ? "items-end" : "items-start"
                }`}
            >
                <div
                    className={`rounded-lg px-4 py-2 ${
                        isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                    }`}
                >
                    <p className="text-sm">
                        <MarkdownContent content={displayedText} />
                    </p>
                </div>
            </div>
        </div>
    )
}
