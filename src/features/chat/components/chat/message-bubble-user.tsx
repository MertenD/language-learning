import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserIcon } from "lucide-react"
import { MarkdownContent } from "@/components/markdown-content"

interface MessageBubbleUserProps {
    text: string
}

export default function MessageBubbleUser({ text }: MessageBubbleUserProps) {
    function renderBubble(content: string) {
        return (
            <div className="flex max-w-[75%] flex-col gap-1 items-end">
                <div className="rounded-xl px-5 py-3 w-full bg-primary shadow-md">
                    <p className="text-sm text-primary-foreground leading-relaxed">
                        <MarkdownContent content={content} />
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex gap-3 flex-row-reverse animate-in fade-in slide-in-from-right-2 duration-500">
            <Avatar className="h-9 w-9 shadow-sm border-2 border-card">
                <AvatarImage src="/diverse-user-avatars.png" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80">
                    <UserIcon className="h-4 w-4 text-primary-foreground" />
                </AvatarFallback>
            </Avatar>
            {renderBubble(text)}
        </div>
    )
}
