import {createTRPCRouter, premiumProcedure, protectedProcedure} from "@/trpc/init";
import prisma from "@/lib/db";
import {z} from "zod";
import {PAGINATION} from "@/config/constants";
import {createWordSchema} from "@/features/words/schema/word-crud-schema";

export const wordsRouter = createTRPCRouter({
    create: premiumProcedure
        .input(createWordSchema)
        .mutation(({ ctx, input }) => {
            return prisma.word.create({
                data: {
                    german: input.german,
                    germanInfo: input.germanInfo,
                    serbian: input.serbian,
                    serbianInfo: input.serbianInfo,
                    userId: ctx.auth.user.id
                }
            })
    }),
    remove: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(({ ctx, input }) => {
            return prisma.word.delete({
                where: { id: input.id, userId: ctx.auth.user.id }
            })
    }),
    update: premiumProcedure
        .input(z.object({
            id: z.string().min(1),
            german: z.string().min(1).optional(),
            germanInfo: z.string().min(1).optional(),
            serbian: z.string().min(1).optional(),
            serbianInfo: z.string().min(1).optional()
        }))
        .mutation(({ ctx, input }) => {
            return prisma.word.update({
                where: { id: input.id, userId: ctx.auth.user.id },
                data: {
                    german: input.german,
                    germanInfo: input.germanInfo,
                    serbian: input.serbian,
                    serbianInfo: input.serbianInfo,
                }
            })
        }),
    getOne: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .query(({ ctx, input }) => {
            return prisma.word.findUnique({
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
                prisma.word.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where: {
                        OR: [
                            {
                                userId: ctx.auth.user.id,
                                serbian: {
                                    contains: search,
                                    mode: "insensitive"
                                }
                            },
                            {
                                userId: ctx.auth.user.id,
                                german: {
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
                prisma.word.count({
                    where: {
                        OR: [
                            {
                                userId: ctx.auth.user.id,
                                serbian: {
                                    contains: search,
                                    mode: "insensitive"
                                }
                            },
                            {
                                userId: ctx.auth.user.id,
                                german: {
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