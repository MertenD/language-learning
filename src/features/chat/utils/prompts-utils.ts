import {ChatAiAnswer} from "@/features/chat/model/chat-model";

export default function parseChatAiAnswer(text: string): ChatAiAnswer {
    const targetsStatusMatch = matchTagContent(text, "GOALS_STATUS");
    return {
        conversation: matchTagContent(text, "CONVERSATION"),
        explanation: matchTagContent(text, "EXPLANATION"),
        exampleAnswers: matchTagContent(text, "EXAMPLE_ANSWERS"),
        mistakes: matchTagContent(text, "MISTAKES"),
        targetsStatus: targetsStatusMatch ? JSON.parse(targetsStatusMatch) : undefined,
    }
}

function matchTagContent(text: string, tag: string): string | undefined {
    return text.match(
        new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`),
    )?.[1]?.trim()
}