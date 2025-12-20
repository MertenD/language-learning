import {Prisma} from "@/generated/prisma/client"
import prisma from "@/lib/db"
import type {UIMessage} from "ai"
import {v4 as uuidv4} from "uuid";

export async function createEmptyChat(userId: string, title?: string, systemMessage?: string) {
  const chat = await prisma.chat.create({
    data: {
      userId,
      title: title,
      messages: [
        ...(systemMessage ? [{
          id: uuidv4(),
          role: "system",
          parts: [
            {
              type: "text",
              text: systemMessage
            }
          ]
        }] : []),
      ]
    },
  })
  return chat.id
}

export async function loadChat(chatId: string, userId: string) {
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId: userId },
  })

  if (!chat) {
    throw new Error("Chat not found")
  }

  return {
    id: chat.id,
    assistantName: chat.assistantName,
    messages: (chat.messages as unknown as UIMessage[]) ?? [],
    activeStreamId: chat.activeStreamId ?? null,
  }
}

export async function saveChat(args: {
  chatId: string
  userId: string
  messages: UIMessage[]
  activeStreamId?: string | null
}) {
  const { chatId, userId, messages, activeStreamId = null } = args

  await prisma.chat.update({
    where: {
      id: chatId,
      userId,
    },
    data: {
      messages: messages as unknown as Prisma.JsonArray,
      activeStreamId,
    },
  })
}

