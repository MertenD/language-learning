import {createTRPCRouter, protectedProcedure, baseProcedure} from "@/trpc/init";
import {z} from "zod";
import prisma from "@/lib/db";
import {ActivityType} from "@/generated/prisma/enums";

export const userRouter = createTRPCRouter({
    getAvailableLanguages: baseProcedure
        .query(async () => {
             return prisma.language.findMany();
        }),

    getRecentActivities: protectedProcedure
        .input(z.object({ languageId: z.string().min(1) }))
        .query(async ({ ctx, input }) => {
            const userLanguage = await prisma.userLanguage.findUnique({
                where: {
                    userId_languageId: {
                        userId: ctx.auth.user.id,
                        languageId: input.languageId
                    }
                },
                select: { id: true }
            })

            if (!userLanguage) return []

            const activities = await prisma.userLanguageActivity.findMany({
                where: {
                    userLanguageId: userLanguage.id
                },
                orderBy: {
                    timestamp: "desc"
                },
                take: 5
            })

            return activities.map(activity => ({
                id: activity.id,
                type: activity.type,
                timestamp: activity.timestamp
            }))
        }),

    getLanguageStats: protectedProcedure
        .input(z.object({ languageId: z.string().min(1) }))
        .query(async ({ ctx, input }) => {
            const userLanguage = await prisma.userLanguage.findUnique({
                where: {
                    userId_languageId: {
                        userId: ctx.auth.user.id,
                        languageId: input.languageId
                    }
                },
                include: {
                    stats: true,
                    activities: {
                        select: {
                            timestamp: true
                        },
                        orderBy: {
                            timestamp: "desc"
                        }
                    }
                }
            })

            if (!userLanguage || !userLanguage.stats) {
                console.log(`UserLanguage or stats not found for langauge ${input.languageId} and user ${ctx.auth.user.id}`)
                return null
            }

            // Calculate amount of words added in the language
            const wordCount = await prisma.word.count({
                where: {
                    userId: ctx.auth.user.id,
                    category: {
                        languageId: input.languageId
                    }
                }
            })

            // Calculate streak from activity dates
            let streakDays = 0

            const activities = userLanguage.activities;
            if (activities.length > 0) {
                const uniqueDays = Array.from(new Set(
                    activities.map(a => new Date(a.timestamp).setHours(0, 0, 0, 0))
                )).sort((a, b) => b - a); // Sort descending

                const now = new Date();
                const today = new Date(now).setHours(0, 0, 0, 0);
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayTime = yesterday.setHours(0, 0, 0, 0);

                if (uniqueDays[0] === today || uniqueDays[0] === yesterdayTime) {
                    streakDays = 1;

                    for (let i = 0; i < uniqueDays.length - 1; i++) {
                        const currentDay = uniqueDays[i];
                        const previousDay = uniqueDays[i + 1];

                        const diffDays = (currentDay - previousDay) / (1000 * 60 * 60 * 24);

                        if (diffDays === 1) {
                            streakDays++;
                        } else {
                            // Found a gap in the streak, stop counting
                            break;
                        }
                    }
                }
            }

            return {
                ...userLanguage.stats,
                wordCount,
                streakDays
            }
        }),

    getLanguages: protectedProcedure
        .query(async ({ ctx }) => {
            let userLanguages = await prisma.userLanguage.findMany({
                where: {
                    userId: ctx.auth.user.id
                },
                include: {
                    language: true
                }
            })

            return userLanguages.map(ul => ul.language);
        }),

    setLanguage: protectedProcedure
        .input(z.object({ languageId: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            await prisma.user.update({
                where: {
                    id: ctx.auth.user.id
                },
                data: {
                    currentLanguageId: input.languageId
                }
            })
        }),

    addLanguage: protectedProcedure
        .input(z.object({ languageId: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            // Check if language exists
            const existingLanguage = await prisma.userLanguage.findUnique({
                where: {
                    userId_languageId: {
                        userId: ctx.auth.user.id,
                        languageId: input.languageId
                    }
                }
            })

            if (existingLanguage) {
                // Already added
                return;
            }

            await prisma.userLanguage.create({
                data: {
                    userId: ctx.auth.user.id,
                    languageId: input.languageId,
                    stats: {
                        create: {
                            streakStartedAt: new Date(),
                            lastActivityAt: new Date(),
                        }
                    },
                    activities: {
                        create: {
                            type: ActivityType.LANGUAGE_STARTED,
                            timestamp: new Date()
                        }
                    }
                }
            })
        }),

    removeLanguage: protectedProcedure
        .input(z.object({ languageId: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const user = await prisma.user.findUnique({
                where: { id: ctx.auth.user.id },
                include: { languages: true }
            })

            if (!user) return;

            // Prevent removing native language? Maybe not necessary as native language is separate field.
            // Check if user has other languages
            if (user.languages.length <= 1) {
                throw new Error("Cannot remove the only language.")
            }

            // If removing current language, switch to another one
            if (user.currentLanguageId === input.languageId) {
                const otherLanguage = user.languages.find(l => l.languageId !== input.languageId)
                if (otherLanguage) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { currentLanguageId: otherLanguage.languageId }
                    })
                }
            }

            await prisma.userLanguage.delete({
                where: {
                   userId_languageId: {
                       userId: ctx.auth.user.id,
                       languageId: input.languageId
                   }
                }
            })
        })
})