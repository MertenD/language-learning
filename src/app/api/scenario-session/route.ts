import {after, type NextRequest} from "next/server"
import {convertToModelMessages, createIdGenerator, streamText, type UIMessage} from "ai"
import {loadSession, saveSession} from "@/features/scenarios/server/session-store"
import {createResumableStreamContext} from "resumable-stream"
import {requirePremiumUserFromRequest} from "@/lib/auth-utils"
import {createOpenRouter} from "@openrouter/ai-sdk-provider"
import parseChatAiAnswer from "@/features/chat/utils/prompts-utils"
import {getUserLearningContext} from "@/features/user/server/learning-context-service"
import {createLearningContextMessage} from "@/features/chat/utils/prompts"

export const maxDuration = 60

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
})

export async function POST(req: NextRequest) {
    try {
        const {user} = await requirePremiumUserFromRequest(req)

        const {message, id}: {message: UIMessage; id: string} = await req.json()

        const [session, learningContext] = await Promise.all([
            loadSession(id, user.id),
            getUserLearningContext(user.id, (user as any).currentLanguageId),
        ])

        const messages: UIMessage[] = [...session.messages, message]

        await saveSession({
            sessionId: id,
            userId: user.id,
            messages,
            activeStreamId: null,
        })

        const contextMessage: UIMessage = {
            id: "learning-context",
            role: "system",
            parts: [{type: "text", text: createLearningContextMessage(learningContext)}],
        }

        const result = streamText({
            model: openrouter("deepseek/deepseek-v3.2"),
            messages: convertToModelMessages([contextMessage, ...messages]),
        })

        const generateMessageId = createIdGenerator({prefix: "msg", size: 16})

        return result.toUIMessageStreamResponse({
            originalMessages: messages,
            generateMessageId,
            async onFinish({messages}) {
                const lastAiMessage = messages.slice().reverse().find(m => m.role === "assistant")
                if (!lastAiMessage) throw new Error("No assistant message found after streaming")

                const text = lastAiMessage.parts.map(p => (p.type === "text" ? p.text : "")).join("")
                const {targetsStatus} = parseChatAiAnswer(text)

                await saveSession({
                    sessionId: id,
                    userId: user.id,
                    messages,
                    targetsStatus,
                    activeStreamId: null,
                })
            },
            async consumeSseStream({stream}) {
                const streamId = generateMessageId()
                const streamContext = createResumableStreamContext({waitUntil: after})

                await streamContext.createNewResumableStream(streamId, () => stream)

                await saveSession({
                    sessionId: id,
                    userId: user.id,
                    messages,
                    activeStreamId: streamId,
                })
            },
        })
    } catch (err) {
        if (err instanceof Response) return err
        console.error(err)
        return new Response("Internal Server Error", {status: 500})
    }
}
