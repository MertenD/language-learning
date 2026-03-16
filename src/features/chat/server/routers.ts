import {createTRPCRouter, premiumProcedure, protectedProcedure} from "@/trpc/init";
import prisma from "@/lib/db";
import {z} from "zod";
import {PAGINATION} from "@/config/constants";
import {v4 as uuidv4} from "uuid";
import {createEmptyChat, loadChat} from "@/features/chat/server/chat-store";
import {createChatSystemMessage} from "@/features/chat/utils/prompts";
import {trackActivity} from "@/features/user/server/activity-service";
import {ActivityType} from "@/features/dashboard/model/activity-type";

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
                        title: {
                            contains: search,
                            mode: "insensitive"
                        }
                    },
                    orderBy: {
                        updatedAt: "desc"
                    }
                }),
                prisma.scenario.count({
                    where: {
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