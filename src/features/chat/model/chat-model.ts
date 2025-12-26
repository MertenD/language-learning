import {UIMessage} from "ai";
import {Chat} from "@/generated/prisma/client";

export type ChatWithUIMessages = Omit<Chat, 'messages'> & {
    messages: UIMessage[]
}

export type ChatAiAnswer = {
    conversation?: string
    explanation?: string
    exampleAnswers?: string
    mistakes?: string
    targetsStatus?: boolean[]
}