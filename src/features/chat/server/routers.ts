import {createTRPCRouter, premiumProcedure, protectedProcedure} from "@/trpc/init";
import prisma from "@/lib/db";
import {z} from "zod";
import {PAGINATION} from "@/config/constants";
import {createEmptyChat, loadChat} from "@/features/chat/server/chat-store";

export const chatsRouter = createTRPCRouter({
    createEmptyChat: premiumProcedure
        .input(z.object({
            title: z.string().optional(),
            systemMessage: z.string().optional(),
            firstMessage: z.string().optional(),
        }))
        .mutation(async ({ctx, input}) => {
            return createEmptyChat(ctx.auth.user.id, ctx.auth.user.currentLanguageId, input.title, input.systemMessage, input.firstMessage)
        }),

    remove: protectedProcedure
        .input(z.object({id: z.string()}))
        .mutation(({ctx, input}) => {
            return prisma.chat.delete({
                where: {id: input.id, userId: ctx.auth.user.id}
            })
        }),

    loadChat: protectedProcedure
        .input(z.object({chatId: z.string()}))
        .query(async ({ctx, input}) => {
            return loadChat(input.chatId, ctx.auth.user.id)
        }),

    getMany: protectedProcedure
        .input(z.object({
            page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
            pageSize: z.number().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE),
            search: z.string().default("")
        }))
        .query(async ({ctx, input}) => {
            const {page, pageSize, search} = input;

            const where = {
                userId: ctx.auth.user.id,
                languageId: ctx.auth.user.currentLanguageId,
                scenarioId: null,
                title: {contains: search, mode: "insensitive" as const}
            }

            const [items, totalCount] = await Promise.all([
                prisma.chat.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where,
                    orderBy: {updatedAt: "desc"}
                }),
                prisma.chat.count({where})
            ])

            const totalPages = Math.ceil(totalCount / pageSize);
            return {
                items,
                page,
                pageSize,
                totalCount,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        })
})
