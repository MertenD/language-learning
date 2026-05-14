import {Prisma} from "@/generated/prisma/client"
import prisma from "@/lib/db"
import type {UIMessage} from "ai"
import {v4 as uuidv4} from "uuid"
import {ScenarioSessionWithUIMessages} from "@/features/scenarios/model/scenario-session-model"
import {createChatSystemMessage} from "@/features/chat/utils/prompts"

export async function loadSession(sessionId: string, userId: string): Promise<ScenarioSessionWithUIMessages> {
    const session = await prisma.scenarioSession.findFirst({
        where: {id: sessionId, userId},
    })
    if (!session) {
        throw new Error("Session not found")
    }
    return {
        ...session,
        messages: (session.messages as unknown as UIMessage[]) ?? [],
    }
}

export async function saveSession(args: {
    sessionId: string
    userId: string
    messages: UIMessage[]
    targetsStatus?: boolean[]
    activeStreamId?: string | null
}) {
    const {sessionId, userId, messages, targetsStatus, activeStreamId = null} = args
    await prisma.scenarioSession.update({
        where: {id: sessionId, userId},
        data: {
            messages: messages as unknown as Prisma.JsonArray,
            activeStreamId,
            ...(targetsStatus !== undefined && {targetsStatus}),
        },
    })
}

export async function createSessionFromScenario(args: {
    scenarioId: string
    userId: string
    nativeLanguageName: string
}): Promise<string> {
    const {scenarioId, userId, nativeLanguageName} = args

    const scenario = await prisma.scenario.findUnique({where: {id: scenarioId}})
    if (!scenario) {
        throw new Error("Scenario not found")
    }
    const language = await prisma.language.findUnique({where: {id: scenario.languageId}})

    const session = await prisma.scenarioSession.create({
        data: {
            userId,
            languageId: scenario.languageId,
            scenarioId: scenario.id,
            title: scenario.title,
            assistantIcon: scenario.image,
            assistantName: scenario.assistantName,
            messages: [
                {
                    id: uuidv4(),
                    role: "system",
                    parts: [
                        {
                            type: "text",
                            text: createChatSystemMessage({
                                targetLanguageName: language?.name ?? "",
                                nativeLanguageName,
                                scenarioTitle: scenario.title,
                                scenarioDescription: scenario.description,
                                scenarioAssistantInstructions: scenario.assistantInstructions,
                                scenarioTargets: scenario.targets,
                                scenarioLevel: scenario.level ?? undefined,
                                scenarioTags: scenario.tags,
                            }),
                        },
                    ],
                },
                {
                    id: uuidv4(),
                    role: "assistant",
                    parts: [{type: "text", text: scenario.firstAssistantMessage}],
                },
            ],
        },
    })

    return session.id
}
