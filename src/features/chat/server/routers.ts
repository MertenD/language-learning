import {createTRPCRouter, premiumProcedure, protectedProcedure} from "@/trpc/init";
import prisma from "@/lib/db";
import {z} from "zod";
import {PAGINATION} from "@/config/constants";
import {v4 as uuidv4} from "uuid";
import {createEmptyChat, loadChat} from "@/features/chat/server/chat-store";
import {createChatSystemMessage} from "@/features/chat/utils/prompts";
import {trackActivity} from "@/features/user/server/activity-service";
import {ActivityType} from "@/features/dashboard/model/activity-type";
import {getUserLearningContext} from "@/features/user/server/learning-context-service";
import {generateObject} from "ai";
import {openrouter, AI_MODEL} from "@/lib/ai";
import {TRPCError} from "@trpc/server";

export const chatsRouter = createTRPCRouter({
    createEmptyChat: premiumProcedure
        .input(z.object({
            title: z.string().optional(),
            systemMessage: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            return createEmptyChat(ctx.auth.user.id, ctx.auth.user.currentLanguageId, input.title, input.systemMessage)
        }),
    createChatFromScenario: premiumProcedure
        .input(z.object({
            scenarioId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const scenario = await prisma.scenario.findUnique({
                where: { id: input.scenarioId }
            })
            if (!scenario) {
                throw new Error("Scenario not found")
            }
            const chat = await prisma.chat.create({
                data: {
                    userId: ctx.auth.user.id,
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
                                        scenarioTitle: scenario.title,
                                        scenarioDescription: scenario.description,
                                        scenarioAssistantInstructions: scenario.assistantInstructions,
                                        scenarioTargets: scenario.targets
                                    })
                                }
                            ]
                        },
                        {
                            id: uuidv4(),
                            role: "assistant",
                            parts: [
                                {
                                    type: "text",
                                    text: scenario.firstAssistantMessage
                                }
                            ]
                        }
                    ]
                },
            })

            await trackActivity(ctx.auth.user.id, scenario.languageId, ActivityType.SCENARIO_STARTED);

            return chat.id
        }),
    remove: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(({ ctx, input }) => {
            return prisma.chat.delete({
                where: { id: input.id, userId: ctx.auth.user.id }
            })
        }),
    loadChat: protectedProcedure
        .input(z.object({ chatId: z.string() }))
        .query(async ({ ctx, input }) => {
            return loadChat(input.chatId, ctx.auth.user.id)
        }),
    getMany: protectedProcedure
        .input(z.object({
            page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
            pageSize: z.number().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE),
            search: z.string().default("")
        }))
        .query(async ({ ctx, input }) => {
            const { page, pageSize, search } = input;

            const [items, totalCount] = await Promise.all([
                prisma.chat.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where: {
                        userId: ctx.auth.user.id,
                        languageId: ctx.auth.user.currentLanguageId,
                        title: {
                            contains: search,
                            mode: "insensitive"
                        }
                    },
                    orderBy: {
                        updatedAt: "desc"
                    }
                }),
                prisma.chat.count({
                    where: {
                        userId: ctx.auth.user.id,
                        languageId: ctx.auth.user.currentLanguageId,
                        title: {
                            contains: search,
                            mode: "insensitive"
                        }
                    },
                })
            ])

            const totalPages = Math.ceil(totalCount / pageSize);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            return {
                items,
                page,
                pageSize,
                totalCount,
                totalPages,
                hasNextPage,
                hasPreviousPage
            }
        })
})

export const scenariosRouter = createTRPCRouter({
    getMany: protectedProcedure
        .input(z.object({
            scenariosPage: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
            scenariosPageSize: z.number().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE),
            scenariosSearch: z.string().default("")
        }))
        .query(async ({ ctx, input }) => {
            const { scenariosPage: page, scenariosPageSize: pageSize, scenariosSearch: search } = input;

            const [items, totalCount] = await Promise.all([
                prisma.scenario.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where: {
                        languageId: ctx.auth.user.currentLanguageId,
                        userId: null,
                        title: { contains: search, mode: "insensitive" }
                    },
                    orderBy: { updatedAt: "desc" }
                }),
                prisma.scenario.count({
                    where: {
                        languageId: ctx.auth.user.currentLanguageId,
                        userId: null,
                        title: { contains: search, mode: "insensitive" }
                    },
                })
            ])

            const totalPages = Math.ceil(totalCount / pageSize);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            return { items, page, pageSize, totalCount, totalPages, hasNextPage, hasPreviousPage }
        }),

    getAiSuggestions: protectedProcedure.query(async ({ ctx }) => {
        return prisma.scenario.findMany({
            where: {
                userId: ctx.auth.user.id,
                languageId: ctx.auth.user.currentLanguageId,
                isAiGenerated: true,
            },
            orderBy: { generatedAt: "desc" },
        })
    }),

    getUserScenarios: protectedProcedure.query(async ({ ctx }) => {
        return prisma.scenario.findMany({
            where: {
                userId: ctx.auth.user.id,
                languageId: ctx.auth.user.currentLanguageId,
                isUserCreated: true,
            },
            orderBy: { updatedAt: "desc" },
        })
    }),

    generateForUser: premiumProcedure
        .input(z.object({ force: z.boolean().default(false) }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId, currentLanguageId } = ctx.auth.user

            // Cache: return existing if < 24h old and not forcing
            if (!input.force) {
                const cached = await prisma.scenario.findFirst({
                    where: { userId, isAiGenerated: true, languageId: currentLanguageId },
                    orderBy: { generatedAt: "desc" },
                })
                if (cached?.generatedAt) {
                    const ageMs = Date.now() - cached.generatedAt.getTime()
                    if (ageMs < 24 * 60 * 60 * 1000) {
                        return prisma.scenario.findMany({
                            where: { userId, isAiGenerated: true, languageId: currentLanguageId },
                        })
                    }
                }
            }

            const [learningContext, currentLanguage] = await Promise.all([
                getUserLearningContext(userId, currentLanguageId),
                prisma.language.findUnique({ where: { id: currentLanguageId } }),
            ])

            if (!currentLanguage) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Language not found" })
            }

            const knownWordsText = learningContext.masteredWords.length > 0
                ? learningContext.masteredWords.map(w => `${w.primary} → ${w.secondary}`).join(", ")
                : "noch keine Vokabeln gespeichert"

            const { object } = await generateObject({
                model: openrouter(AI_MODEL),
                schema: z.object({
                    scenarios: z.array(z.object({
                        type: z.enum(["consolidation", "stretch"]),
                        title: z.string().describe("Kurzer prägnanter Titel des Szenarios"),
                        description: z.string().describe("1-2 Sätze Beschreibung was in diesem Szenario passiert"),
                        image: z.string().describe("Ein einzelnes passendes Emoji"),
                        assistantName: z.string().describe("Name des Gesprächspartners (z.B. 'Maria', 'Kellner', 'Arzt')"),
                        assistantInstructions: z.string().describe("Kurze Systemanweisung für den Assistenten: welche Rolle spielt er, wie verhält er sich"),
                        firstAssistantMessage: z.string().describe(`Die erste Nachricht des Assistenten auf ${currentLanguage.name}, die das Gespräch eröffnet`),
                        targets: z.array(z.string()).min(2).max(5).describe("Lernziele die der Nutzer in diesem Szenario erreichen soll"),
                    }))
                }),
                prompt: `Erstelle 5 Konversationsszenarien zum Üben von ${currentLanguage.name}.

NUTZERPROFIL:
- Sprachlevel: ${learningContext.level}
- Bekannte Vokabeln: ${knownWordsText}
- Grammatikkenntnisse: ${learningContext.grammarNotes.map(g => g.title).join(", ") || "keine gespeichert"}

AUFTRAG:
- 3 "consolidation" Szenarien: Situationen, wo die bekannten Vokabeln natürlich vorkommen und geübt werden (orientiere dich also an dem aktuellen Stand des Nutzers)
- 2 "stretch" Szenarien: Völlig neue Themen die zum Niveau passen, aber neue Vokabeln einführen

REGELN:
- Szenarien sollen realistisch und motivierend sein
- Gesprächspartner hat einen passenden echten Namen
- firstAssistantMessage muss auf ${currentLanguage.name} sein
- targets sind konkrete Gesprächsziele die der Nutzer erreichen soll
- Nicht zu einfach, nicht zu schwer — herausfordernd aber erreichbar`,
            })

            // Delete old AI suggestions for this user/language
            await prisma.scenario.deleteMany({
                where: { userId, isAiGenerated: true, languageId: currentLanguageId },
            })

            const now = new Date()
            const created = await Promise.all(
                object.scenarios.map(s =>
                    prisma.scenario.create({
                        data: {
                            title: s.title,
                            description: s.description,
                            image: s.image,
                            assistantName: s.assistantName,
                            assistantInstructions: s.assistantInstructions,
                            firstAssistantMessage: s.firstAssistantMessage,
                            targets: s.targets,
                            languageId: currentLanguageId,
                            userId,
                            isAiGenerated: true,
                            generatedAt: now,
                        },
                    })
                )
            )

            return created
        }),

    createUserScenario: premiumProcedure
        .input(z.object({
            title: z.string().min(1).max(100),
            description: z.string().min(1).max(500),
            image: z.string().min(1).max(10),
            assistantName: z.string().min(1).max(50),
            assistantInstructions: z.string().min(1),
            firstAssistantMessage: z.string().min(1),
            targets: z.array(z.string().min(1)).min(1).max(10),
        }))
        .mutation(async ({ ctx, input }) => {
            return prisma.scenario.create({
                data: {
                    ...input,
                    userId: ctx.auth.user.id,
                    languageId: ctx.auth.user.currentLanguageId,
                    isUserCreated: true,
                },
            })
        }),

    updateUserScenario: premiumProcedure
        .input(z.object({
            id: z.string().min(1),
            title: z.string().min(1).max(100),
            description: z.string().min(1).max(500),
            image: z.string().min(1).max(10),
            assistantName: z.string().min(1).max(50),
            assistantInstructions: z.string().min(1),
            firstAssistantMessage: z.string().min(1),
            targets: z.array(z.string().min(1)).min(1).max(10),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input
            return prisma.scenario.update({
                where: { id, userId: ctx.auth.user.id },
                data,
            })
        }),

    removeUserScenario: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            return prisma.scenario.delete({
                where: { id: input.id, userId: ctx.auth.user.id },
            })
        }),
})