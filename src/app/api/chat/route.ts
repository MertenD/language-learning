import {after, type NextRequest} from "next/server"
import {convertToModelMessages, createIdGenerator, streamText, type UIMessage,} from "ai"
import {loadChat, saveChat} from "@/features/chat/server/chat-store"
import {createResumableStreamContext} from "resumable-stream"
import {requirePremiumUserFromRequest} from "@/lib/auth-utils";
import {createOpenRouter} from "@openrouter/ai-sdk-provider";
import parseChatAiAnswer from "@/features/chat/utils/prompts-utils";

export const maxDuration = 60
// const google = createGoogleGenerativeAI()
//const openai = createOpenAI()
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { user } = await requirePremiumUserFromRequest(req)

    const { message, id }: { message: UIMessage; id: string } = await req.json()

    const chat = await loadChat(id, user.id)
    const previousMessages = chat.messages

    const messages: UIMessage[] = [...previousMessages, message]

    await saveChat({
      chatId: id,
      userId: user.id,
      messages,
      activeStreamId: null,
    })

    const result = streamText({
      model: openrouter("google/gemini-2.5-flash-lite"),
      messages: convertToModelMessages(messages),
    })
    
    const generateMessageId = createIdGenerator({
      prefix: "msg",
      size: 16,
    })

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      generateMessageId,
      async onFinish({ messages }) {
        const lastAiAssistantMessage = messages
          .slice()
          .reverse()
          .find((msg) => msg.role === "assistant")

        if (!lastAiAssistantMessage) {
          throw new Error("No assistant message found after streaming")
        }

        const lastAiMessageText = lastAiAssistantMessage.parts
          .map((part) => (part.type === "text" ? part.text : ""))
          .join("")

        const { targetsStatus } = parseChatAiAnswer(lastAiMessageText)

        await saveChat({
          chatId: id,
          userId: user.id,
          messages,
          targetsStatus: targetsStatus,
          activeStreamId: null,
        })
      },
      async consumeSseStream({ stream }) {
        const streamId = generateMessageId()
        const streamContext = createResumableStreamContext({ waitUntil: after })

        await streamContext.createNewResumableStream(streamId, () => stream)

        await saveChat({
          chatId: id,
          userId: user.id,
          messages,
          activeStreamId: streamId,
        })
      },
    })
  } catch (err) {
    if (err instanceof Response) {
      return err
    }

    console.error(err)
    return new Response("Internal Server Error", { status: 500 })
  }
}

