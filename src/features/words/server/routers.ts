import {createTRPCRouter, premiumProcedure, protectedProcedure} from "@/trpc/init";
import prisma from "@/lib/db";
import {z} from "zod";
import {PAGINATION} from "@/config/constants";
import {createWordSchema} from "@/features/words/schema/word-crud-schema";
import {createCategorySchema} from "@/features/words/schema/category-crud-schema";

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
                    userId: ctx.auth.user.id,
                    categoryId: input.categoryId
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
                    germanInfo: input.germanInfo || null,
                    serbian: input.serbian,
                    serbianInfo: input.serbianInfo || null,
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
            search: z.string().default(""),
            categoryId: z.string().optional().nullable()
        }))
        .query(async ({ ctx, input }) => {
            const { page, pageSize, search, categoryId } = input;

            // If categoryId is empty string, treat it as null (root level)
            const effectiveCategoryId = categoryId === "" ? null : categoryId;

            const [items, totalCount] = await Promise.all([
                prisma.word.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where: {
                        userId: ctx.auth.user.id,
                        categoryId: effectiveCategoryId,
                        OR: [
                            {
                                serbian: {
                                    contains: search,
                                    mode: "insensitive"
                                }
                            },
                            {
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
                        userId: ctx.auth.user.id,
                        categoryId: effectiveCategoryId,
                        OR: [
                            {
                                serbian: {
                                    contains: search,
                                    mode: "insensitive"
                                }
                            },
                            {
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

export const categoriesRouter = createTRPCRouter({
    createCategory: premiumProcedure
        .input(createCategorySchema)
        .mutation(({ ctx, input }) => {
            return prisma.wordCategory.create({
                data: {
                    name: input.name,
                    parentId: input.parentId,
                    userId: ctx.auth.user.id
                }
            })
        }),
    removeCategory: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(({ ctx, input }) => {
            return prisma.wordCategory.delete({
                where: { id: input.id, userId: ctx.auth.user.id }
            })
        }),
    getCategories: protectedProcedure
        .input(z.object({
            parentId: z.string().optional().nullable()
        }))
        .query(({ ctx, input }) => {
            // If parentId is empty string, treat it as null (root level)
            const effectiveParentId = input.parentId === "" ? null : input.parentId;

            return prisma.wordCategory.findMany({
                where: {
                    userId: ctx.auth.user.id,
                    parentId: effectiveParentId
                },
                orderBy: {
                    name: "asc"
                }
            })
        }),
    getCategory: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(({ ctx, input }) => {
            return prisma.wordCategory.findUnique({
                where: { id: input.id, userId: ctx.auth.user.id },
                include: {
                    parent: true
                }
            })
        }),
    getCategoryPath: protectedProcedure
        .input(z.object({ id: z.string().nullable().optional() }))
        .query(async ({ ctx, input }) => {
            if (!input.id) return [];

            const path = [];
            let currentId: string | null = input.id;

            while (currentId) {
                const category: { id: string, name: string, parentId: string | null } | null = await prisma.wordCategory.findUnique({
                    where: { id: currentId, userId: ctx.auth.user.id },
                    select: { id: true, name: true, parentId: true }
                });

                if (!category) break;

                path.unshift(category);
                currentId = category.parentId;
            }

            return path;
        })
})