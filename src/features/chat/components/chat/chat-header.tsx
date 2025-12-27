import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot } from "lucide-react"

interface ChatHeaderProps {
    assistantName: string
    isLoading: boolean
}

export function ChatHeader({ assistantName, isLoading }: ChatHeaderProps) {
    return (
        <div className="flex items-center gap-3 border-b bg-gradient-to-r from-background to-muted/30 backdrop-blur-sm p-5 shrink-0 shadow-sm">
            <Avatar className="h-10 w-10 shadow-md border-2 border-white dark:border-slate-800">
                <AvatarImage src="/ai-assistant-concept.png" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80">
                    <Bot className="h-5 w-5 text-white" />
                </AvatarFallback>
            </Avatar>
            <div>
                <h2 className="font-semibold text-lg">{assistantName}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isLoading ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                    {isLoading ? "Antwort wird generiert..." : "Online"}
                </p>
            </div>
        </div>
    )
}
