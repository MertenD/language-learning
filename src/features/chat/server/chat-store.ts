import { Prisma } from "@/generated/prisma/client"
import prisma from "@/lib/db"
import type { UIMessage } from "ai"
import {v4 as uuidv4} from "uuid";

export async function createChat(userId: string) {
  const chat = await prisma.chat.create({
    data: {
      userId,
      messages: [
          {
              id: uuidv4(),
              role: "system",
              parts: [
                  {
                      type: "text",
                      text: "You are a helpful serbian learning assistant. Help the user learn Serbian by engaging in conversations, answering questions, and providing explanations about the Serbian language and culture. Always provide a serbian message and after that its german translation and some explanation."
                  }
              ]
          }
      ],
    },
  })
  return chat.id
}

export async function loadChat(chatId: string, userId: string) {
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId },
  })

  if (!chat) throw new Error("Chat not found")

  return {
    id: chat.id,
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

