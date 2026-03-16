import {createTRPCRouter, premiumProcedure, protectedProcedure} from "@/trpc/init";
import prisma from "@/lib/db";
import {z} from "zod";
import {PAGINATION} from "@/config/constants";
import {createGrammarSchema} from "@/features/grammar/schema/grammar-crud-schema";
import {trackActivity} from "@/features/user/server/activity-service";
import {ActivityType} from "@/features/dashboard/model/activity-type";

export const grammarRouter = createTRPCRouter({
    create: premiumProcedure
        .input(createGrammarSchema)
        .mutation(async ({ ctx, input }) => {
            const grammar = await prisma.grammar.create({
                data: {
                    title: input.title,
                    content: input.content,
                    userId: ctx.auth.user.id
                    // TODO languageId should be added in the future when multiple languages are supported
                }
            })

            if (ctx.auth.user.currentLanguageId) {
                await trackActivity(ctx.auth.user.id, ctx.auth.user.currentLanguageId, ActivityType.GRAMMAR_ADDED);
            }

            return grammar;
        }),
    remove: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(({ ctx, input }) => {
            return prisma.grammar.delete({
                where: { id: input.id, userId: ctx.auth.user.id }
            })
        }),
    update: premiumProcedure
        .input(z.object({
            id: z.string().min(1),
            title: z.string().min(1),
            content: z.string().min(1)
        }))
        .mutation(({ ctx, input }) => {
            return prisma.grammar.update({
                where: { id: input.id, userId: ctx.auth.user.id },
                data: {
                    title: input.title,
                    content: input.content
                }
            })
        }),
    getOne: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .query(({ ctx, input }) => {
            return prisma.grammar.findUnique({
                where: { id: input.id, userId: ctx.auth.user.id }
            })
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
                prisma.grammar.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where: {
                        OR: [
                            {
                                userId: ctx.auth.user.id,
                                title: {
                                    contains: search,
                                    mode: "insensitive"
                                }
                            },
                            {
                                userId: ctx.auth.user.id,
                                content: {
                                    contains: search,
                                    mode: "insensitive"
                                }
                            }
                        ]
                    },
                    orderBy: {
                        updatedAt: "desc"
                    }
                }),
                prisma.grammar.count({
                    where: {
                        OR: [
                            {
                                userId: ctx.auth.user.id,
                                title: {
                                    contains: search,
                                    mode: "insensitive"
                                }
                            },
                            {
                                userId: ctx.auth.user.id,
                                content: {
                                    contains: search,
                                    mode: "insensitive"
                                }
                            }
                        ]
                    }
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