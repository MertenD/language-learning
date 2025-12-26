import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {UserIcon} from "lucide-react";
import {MarkdownContent} from "@/components/markdown-content";

export default function MessageBubbleUser({ text }: { text: string }) {

    function renderBubble(content: string, backgroundColor?: string) {
        return <div
            className={`flex max-w-[75%] flex-col gap-1 items-end`}
        >
            <div
                className={`rounded-lg px-4 py-2 w-full overflow-x-auto ${
                    backgroundColor ? backgroundColor : "bg-primary text-primary-foreground"
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
            className={`flex gap-3 flex-row-reverse`}
        >
            <Avatar className="h-8 w-8">
                <AvatarImage src="/diverse-user-avatars.png"/>
                <AvatarFallback>
                    <UserIcon className="h-4 w-4"/>
                </AvatarFallback>
            </Avatar>
            { renderBubble(text) }
        </div>
    )
}
