import {createTRPCRouter, premiumProcedure, protectedProcedure} from "@/trpc/init";
import prisma from "@/lib/db";
import {z} from "zod";
import {PAGINATION} from "@/config/constants";
import {createWordSchema, csvWordSchema, CsvWordInput} from "@/features/words/schema/word-crud-schema";
import {createCategorySchema} from "@/features/words/schema/category-crud-schema";
import {trackActivity} from "@/features/user/server/activity-service";
import {ActivityType} from "@/features/dashboard/model/activity-type";
import Papa from "papaparse";
import {TRPCError} from "@trpc/server";

export const wordsRouter = createTRPCRouter({
    create: premiumProcedure
        .input(createWordSchema)
        .mutation(async ({ ctx, input }) => {
            const word = await prisma.word.create({
                data: {
                    primary: input.primary,
                    primaryInfo: input.primaryInfo,
                    secondary: input.secondary,
                    secondaryInfo: input.secondaryInfo,
                    userId: ctx.auth.user.id,
                    categoryId: input.categoryId,
                    languageId: ctx.auth.user.currentLanguageId
                }
            })

            await trackActivity(ctx.auth.user.id, ctx.auth.user.currentLanguageId, ActivityType.VOCABULARY_ADDED)

            return word
    }),
    import: premiumProcedure
        .input(z.object({
            csv: z.string(),
            categoryId: z.string().optional().nullable()
        }))
        .mutation(async ({ ctx, input }) => {
            const { csv, categoryId } = input;
            const { currentLanguageId } = ctx.auth.user;

            const parseResult = Papa.parse(csv, {
                header: true,
                skipEmptyLines: true,
                transformHeader: h => h.trim()
            })

            if (parseResult.errors.length > 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid CSV format: " + parseResult.errors.map(e => e.message).join(", ")
                })
            }

            const rows = parseResult.data as any[]
            const validWords: CsvWordInput[] = []
            const errors: string[] = []

            rows.forEach((row, index) => {
                const result = csvWordSchema.safeParse(row)
                if (result.success) {
                    validWords.push(result.data)
                } else {
                    errors.push(`Row ${index + 1}: ${result.error.issues.map((e: any) => e.message).join(", ")}`)
                }
            })

            if (errors.length > 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Validation errors:\n" + errors.join("\n")
                })
            }

            if (validWords.length === 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "No valid words found in CSV"
                })
            }

            const userLanguage = await prisma.userLanguage.findUnique({
                where: {
                    userId_languageId: {
                        userId: ctx.auth.user.id,
                        languageId: currentLanguageId
                    }
                }
            })

            const effectiveCategoryId = categoryId === "" ? null : categoryId;

            const count = await prisma.word.createMany({
                data: validWords.map(w => ({
                    primary: w.primary,
                    primaryInfo: w.primaryInfo || null,
                    secondary: w.secondary,
                    secondaryInfo: w.secondaryInfo || null,
                    examples: w.examples ? w.examples.split(" | ").map(e => e.trim()).filter(Boolean) : [],
                    userId: ctx.auth.user.id,
                    languageId: currentLanguageId,
                    userLanguageId: userLanguage?.id,
                    categoryId: effectiveCategoryId
                }))
            })

            if (count.count > 0) {
                await trackActivity(ctx.auth.user.id, currentLanguageId, ActivityType.VOCABULARY_IMPORTED)
            }

            return { count: count.count }
        }),
    export: premiumProcedure
        .input(z.object({
            categoryId: z.string().optional().nullable()
        }))
        .mutation(async ({ ctx, input }) => {
            const { currentLanguageId } = ctx.auth.user;
            const { categoryId } = input;
            const effectiveCategoryId = categoryId === "" ? null : categoryId;

            const words = await prisma.word.findMany({
                where: {
                    userId: ctx.auth.user.id,
                    languageId: currentLanguageId,
                    categoryId: effectiveCategoryId
                },
                select: {
                    primary: true,
                    primaryInfo: true,
                    secondary: true,
                    secondaryInfo: true,
                    examples: true
                }
            })

            const data = words.map(w => ({
                primary: w.primary,
                primaryInfo: w.primaryInfo || "",
                secondary: w.secondary,
                secondaryInfo: w.secondaryInfo || "",
                examples: w.examples.join(" | ")
            }))

            return Papa.unparse(data, {
                quotes: true
            });
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
            primary: z.string().min(1).optional(),
            primaryInfo: z.string().min(1).optional(),
            secondary: z.string().min(1).optional(),
            secondaryInfo: z.string().min(1).optional(),
            categoryId: z.string().optional().nullable()
        }))
        .mutation(({ ctx, input }) => {
            return prisma.word.update({
                where: { id: input.id, userId: ctx.auth.user.id },
                data: {
                    primary: input.primary,
                    primaryInfo: input.primaryInfo || null,
                    secondary: input.secondary,
                    secondaryInfo: input.secondaryInfo || null,
                    categoryId: input.categoryId || null
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
                        languageId: ctx.auth.user.currentLanguageId,
                        categoryId: effectiveCategoryId,
                        OR: [
                            {
                                secondary: {
                                    contains: search,
                                    mode: "insensitive"
                                }
                            },
                            {
                                primary: {
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
                        languageId: ctx.auth.user.currentLanguageId,
                        categoryId: effectiveCategoryId,
                        OR: [
                            {
                                secondary: {
                                    contains: search,
                                    mode: "insensitive"
                                }
                            },
                            {
                                primary: {
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
        }),
    getAll: protectedProcedure
        .input(z.object({
            categoryId: z.string().optional().nullable()
        }))
        .query(async ({ ctx, input }) => {
            const { categoryId } = input;
            const effectiveCategoryId = categoryId === "" ? null : categoryId;

            return prisma.word.findMany({
                where: {
                    userId: ctx.auth.user.id,
                    languageId: ctx.auth.user.currentLanguageId,
                    categoryId: effectiveCategoryId
                },
                orderBy: {
                    updatedAt: "desc"
                }
            });
        })
})

export const categoriesRouter = createTRPCRouter({
    createCategory: premiumProcedure
        .input(createCategorySchema)
        .mutation(async ({ ctx, input }) => {
            return prisma.wordCategory.create({
                data: {
                    name: input.name,
                    parentId: input.parentId,
                    userId: ctx.auth.user.id,
                    languageId: ctx.auth.user.currentLanguageId
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
                    languageId: ctx.auth.user.currentLanguageId,
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
        }),
    getAllCategories: protectedProcedure
        .query(({ ctx }) => {
            return prisma.wordCategory.findMany({
                where: {
                    userId: ctx.auth.user.id,
                    languageId: ctx.auth.user.currentLanguageId
                },
                orderBy: {
                    name: "asc"
                }
            })
        })
})