import {createTRPCRouter, protectedProcedure} from "@/trpc/init";
import {z} from "zod";
import prisma from "@/lib/db";

export const userRouter = createTRPCRouter({
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
        })
})