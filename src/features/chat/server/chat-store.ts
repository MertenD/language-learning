import {Prisma, Chat} from "@/generated/prisma/client"
import prisma from "@/lib/db"
import type {UIMessage} from "ai"
import {v4 as uuidv4} from "uuid";
import {ChatWithUIMessages} from "@/features/chat/model/chat-model";

export async function createEmptyChat(
  userId: string,
  languageId: string,
  title?: string,
  systemMessage?: string,
  firstMessage?: string,
) {
  const chat = await prisma.chat.create({
    data: {
      userId,
      languageId,
      title,
      messages: [
        ...(systemMessage ? [{
          id: uuidv4(),
          role: "system",
          parts: [{ type: "text", text: systemMessage }]
        }] : []),
        ...(firstMessage ? [{
          id: uuidv4(),
          role: "assistant",
          parts: [{ type: "text", text: firstMessage }]
        }] : []),
      ]
    },
  })
  return chat.id
}

export async function loadChat(chatId: string, userId: string): Promise<ChatWithUIMessages> {
  const chat: Chat | null = await prisma.chat.findFirst({
    where: { id: chatId, userId: userId },
  })

  if (!chat) {
    throw new Error("Chat not found")
  }

  return {
    ...chat,
    messages: (chat.messages as unknown as UIMessage[]) ?? []
  }
}

export async function saveChat(args: {
  chatId: string
  userId: string
  messages: UIMessage[]
  targetsStatus?: boolean[]
  activeStreamId?: string | null
}) {
  const { chatId, userId, messages, targetsStatus, activeStreamId = null } = args

  await prisma.chat.update({
    where: {
      id: chatId,
      userId,
    },
    data: {
      messages: messages as unknown as Prisma.JsonArray,
      activeStreamId,
      targetsStatus: targetsStatus,
    },
  })
}

