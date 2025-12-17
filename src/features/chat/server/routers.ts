import {createTRPCRouter, premiumProcedure, protectedProcedure} from "@/trpc/init";
import prisma from "@/lib/db";
import {z} from "zod";
import {PAGINATION} from "@/config/constants";
import {SCENARIOS} from "@/features/chat/components/scenarios/scenarios-data";
import {v4 as uuidv4} from "uuid";
import type {UIMessage} from "ai";
import {createEmptyChat, loadChat} from "@/features/chat/server/chat-store";

export const chatsRouter = createTRPCRouter({
    createEmptyChat: premiumProcedure
        .input(z.object({
            title: z.string().optional(),
            systemMessage: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            return createEmptyChat(ctx.auth.user.id, input.title, input.systemMessage)
        }),
    createChatFromScenario: premiumProcedure
        .input(z.object({
            title: z.string(),
            systemMessage: z.string(),
            firstAssistantMessage: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const chat = await prisma.chat.create({
                data: {
                    userId: ctx.auth.user.id,
                    title: input.title,
                    messages: [
                        {
                            id: uuidv4(),
                            role: "system",
                            parts: [
                                {
                                    type: "text",
                                    text: input.systemMessage
                                }
                            ]
                        },
                        {
                            id: uuidv4(),
                            role: "assistant",
                            parts: [
                                {
                                    type: "text",
                                    text: input.firstAssistantMessage
                                }
                            ]
                        }
                    ],
                },
            })
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
            const allScenarios = [...SCENARIOS]

            const filteredScenarios = allScenarios.filter(scenario =>
                scenario.title.toLowerCase().includes(search.toLowerCase()) ||
                scenario.description.toLowerCase().includes(search.toLowerCase())
            )

            const totalCount = filteredScenarios.length;
            const totalPages = Math.ceil(totalCount / pageSize);
            const currentPage = Math.min(page, totalPages) || 1;
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedScenarios = filteredScenarios.slice(startIndex, endIndex);

            return {
                items: paginatedScenarios,
                page: currentPage,
                pageSize,
                totalCount,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1
            }
        })
})