import {createTRPCRouter, premiumProcedure, protectedProcedure} from "@/trpc/init";
import prisma from "@/lib/db";
import {z} from "zod";
import {PAGINATION} from "@/config/constants";
import {createWordSchema, csvWordSchema, CsvWordInput} from "@/features/words/schema/word-crud-schema";
import {createCategorySchema, updateCategorySchema} from "@/features/words/schema/category-crud-schema";
import {trackActivity} from "@/features/user/server/activity-service";
import {ActivityType} from "@/features/dashboard/model/activity-type";
import Papa from "papaparse";
import {TRPCError} from "@trpc/server";
import {generateObject} from "ai";
import {openrouter, AI_MODEL} from "@/lib/ai";

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
                    examples: input.examples ?? [],
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
    bulkDelete: premiumProcedure
        .input(z.object({ ids: z.array(z.string().min(1)).min(1) }))
        .mutation(({ ctx, input }) => {
            return prisma.word.deleteMany({
                where: { id: { in: input.ids }, userId: ctx.auth.user.id }
            })
        }),
    update: premiumProcedure
        .input(z.object({
            id: z.string().min(1),
            primary: z.string().min(1).optional(),
            primaryInfo: z.string().min(1).optional(),
            secondary: z.string().min(1).optional(),
            secondaryInfo: z.string().min(1).optional(),
            categoryId: z.string().optional().nullable(),
            examples: z.array(z.string()).optional()
        }))
        .mutation(({ ctx, input }) => {
            return prisma.word.update({
                where: { id: input.id, userId: ctx.auth.user.id },
                data: {
                    primary: input.primary,
                    primaryInfo: input.primaryInfo || null,
                    secondary: input.secondary,
                    secondaryInfo: input.secondaryInfo || null,
                    categoryId: input.categoryId || null,
                    ...(input.examples !== undefined && { examples: input.examples })
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
            categoryId: z.string().optional().nullable(),
            sortBy: z.enum(["updatedAt", "createdAt", "primary", "secondary"]).default("updatedAt"),
            sortOrder: z.enum(["asc", "desc"]).default("desc"),
        }))
        .query(async ({ ctx, input }) => {
            const { page, pageSize, search, categoryId, sortBy, sortOrder } = input;

            // If categoryId is empty string, treat it as null (root level)
            const effectiveCategoryId = categoryId === "" ? null : categoryId;

            // When searching, ignore category filter to search across all subcategories
            const categoryFilter = search ? undefined : effectiveCategoryId

            const searchFilter = search
                ? {
                    OR: [
                        { secondary: { contains: search, mode: "insensitive" as const } },
                        { primary: { contains: search, mode: "insensitive" as const } },
                    ],
                }
                : {}

            const whereClause = {
                userId: ctx.auth.user.id,
                languageId: ctx.auth.user.currentLanguageId,
                categoryId: categoryFilter,
                ...searchFilter,
            }

            const [items, totalCount] = await Promise.all([
                prisma.word.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where: whereClause,
                    orderBy: { [sortBy]: sortOrder },
                    include: { progress: true }
                }),
                prisma.word.count({ where: whereClause })
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
        }),

    bulkCreate: premiumProcedure
        .input(z.object({
            words: z.array(z.object({
                primary: z.string().min(1),
                secondary: z.string().min(1),
                primaryInfo: z.string().optional(),
                secondaryInfo: z.string().optional(),
                examples: z.array(z.string()).optional(),
                categoryId: z.string().optional().nullable(),
            })).min(1),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId, currentLanguageId } = ctx.auth.user

            const result = await prisma.word.createMany({
                data: input.words.map(w => ({
                    primary: w.primary,
                    primaryInfo: w.primaryInfo || null,
                    secondary: w.secondary,
                    secondaryInfo: w.secondaryInfo || null,
                    examples: w.examples ?? [],
                    categoryId: w.categoryId ?? null,
                    userId,
                    languageId: currentLanguageId,
                })),
            })

            if (result.count > 0) {
                await trackActivity(userId, currentLanguageId, ActivityType.VOCABULARY_ADDED)
            }

            return { count: result.count }
        }),

    getStats: protectedProcedure
        .query(async ({ ctx }) => {
            const { id: userId, currentLanguageId: languageId } = ctx.auth.user

            const [total, progressGroups] = await Promise.all([
                prisma.word.count({ where: { userId, languageId } }),
                prisma.wordProgress.groupBy({
                    by: ["level"],
                    where: { word: { userId, languageId } },
                    _count: { _all: true },
                }),
            ])

            const levelMap = new Map(progressGroups.map(g => [g.level, g._count._all]))
            const learning = [1, 2].reduce((sum, l) => sum + (levelMap.get(l) ?? 0), 0)
            const mastered = levelMap.get(5) ?? 0
            const withProgress = progressGroups.reduce((sum, g) => sum + g._count._all, 0)
            const newWords = total - withProgress + (levelMap.get(0) ?? 0)

            return { total, learning, mastered, new: newWords }
        }),

    generateWords: premiumProcedure
        .input(z.object({
            topic: z.string().min(1).max(150),
            count: z.number().int().min(3).max(20).default(10),
        }))
        .mutation(async ({ ctx, input }) => {
            const { currentLanguageId, nativeLanguageId } = ctx.auth.user

            const [currentLanguage, nativeLanguage, existingWords] = await Promise.all([
                prisma.language.findUnique({ where: { id: currentLanguageId } }),
                prisma.language.findUnique({ where: { id: nativeLanguageId } }),
                prisma.word.findMany({
                    where: { userId: ctx.auth.user.id, languageId: currentLanguageId },
                    select: { primary: true, secondary: true },
                }),
            ])

            if (!currentLanguage || !nativeLanguage) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Language configuration not found" })
            }

            const existingList = existingWords.length > 0
                ? `\nAlready known words (do NOT generate these again):\n${existingWords.map(w => `- ${w.primary} / ${w.secondary}`).join("\n")}\n`
                : ""

            const { object } = await generateObject({
                model: openrouter(AI_MODEL),
                schema: z.object({
                    words: z.array(z.object({
                        primary: z.string().describe(`The word/phrase in ${nativeLanguage.name}`),
                        secondary: z.string().describe(`The word/phrase in ${currentLanguage.name}`),
                        primaryInfo: z.string().optional().describe("Brief grammatical note (optional)"),
                        secondaryInfo: z.string().optional().describe("Brief grammatical note (optional)"),
                        examples: z.array(z.string()).optional().describe(`1–2 short example sentences in ${currentLanguage.name}`),
                    })),
                }),
                prompt: `Generate exactly ${input.count} vocabulary words related to the topic "${input.topic}".

Native language (primary): ${nativeLanguage.name}
Learning language (secondary): ${currentLanguage.name}
${existingList}
Rules:
- "primary" must be in ${nativeLanguage.name}
- "secondary" must be the translation in ${currentLanguage.name}
- "primaryInfo": very brief grammatical hint in ${nativeLanguage.name}, e.g. "das Nomen" or "(verb)" — optional
- "secondaryInfo": very brief grammatical hint in ${currentLanguage.name} — optional
- "examples": 1–2 short, natural example sentences in ${currentLanguage.name} showing the word in context
- Include a mix of nouns, verbs, and adjectives
- Choose practical, commonly used words for this topic
- Do not repeat words`,
            })

            return object.words
        }),
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
        }),

    updateCategory: premiumProcedure
        .input(updateCategorySchema)
        .mutation(({ ctx, input }) => {
            return prisma.wordCategory.update({
                where: { id: input.id, userId: ctx.auth.user.id },
                data: { name: input.name }
            })
        })
})