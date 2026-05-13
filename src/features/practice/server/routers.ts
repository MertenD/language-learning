import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import prisma from "@/lib/db";
import { trackActivity } from "@/features/user/server/activity-service";
import { ActivityType } from "@/features/dashboard/model/activity-type";

const GAME_XP_MULTIPLIERS: Record<string, number> = {
  flashcards: 0.5,
  "multiple-choice": 1.0,
  "true-false": 1.0,
  "reverse-choice": 1.0,
  typing: 1.5,
  scramble: 1.5,
  hangman: 1.5,
  memory: 1.2,
  matching: 1.2,
  listening: 1.0,
  mixed: 1.3,
};

function calculateLevel(totalXp: number): number {
  let level = 1;
  let required = 0;
  while (totalXp >= required + level * 100) {
    required += level * 100;
    level++;
  }
  return level;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + Math.max(1, Math.round(days)));
  return result;
}

export const practiceRouter = createTRPCRouter({
  completeSession: protectedProcedure
    .input(
      z.object({
        gameType: z.string(),
        wordResults: z.array(
          z.object({
            wordId: z.string(),
            correct: z.boolean(),
          }),
        ),
        totalScore: z.number().int().min(0),
        durationSeconds: z.number().int().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { gameType, wordResults, totalScore } = input;
      const { id: userId, currentLanguageId } = ctx.auth.user;

      // 1. Update WordProgress for each tracked word, collecting before/after levels
      const wordUpdates: Array<{
        wordId: string;
        levelBefore: number | null;
        levelAfter: number;
        correct: boolean;
      }> = [];

      for (const result of wordResults) {
        const existing = await prisma.wordProgress.findUnique({
          where: { wordId: result.wordId },
        });

        if (existing) {
          const newLevel = result.correct
            ? Math.min(existing.level + 1, 5)
            : Math.max(existing.level - 1, 0);
          const newIntervalDays = result.correct
            ? Math.max(Math.round(existing.intervalDays * 2.5), 1)
            : 1;

          await prisma.wordProgress.update({
            where: { wordId: result.wordId },
            data: {
              level: newLevel,
              intervalDays: newIntervalDays,
              nextReviewAt: addDays(new Date(), newIntervalDays),
              lastReviewedAt: new Date(),
              repititions: { increment: 1 },
              totalCorrect: { increment: result.correct ? 1 : 0 },
              totalIncorrect: { increment: result.correct ? 0 : 1 },
            },
          });

          wordUpdates.push({ wordId: result.wordId, levelBefore: existing.level, levelAfter: newLevel, correct: result.correct });
        } else {
          const newLevel = result.correct ? 1 : 0;
          await prisma.wordProgress.create({
            data: {
              wordId: result.wordId,
              level: newLevel,
              intervalDays: result.correct ? 2 : 1,
              nextReviewAt: addDays(new Date(), result.correct ? 2 : 1),
              lastReviewedAt: new Date(),
              repititions: 1,
              totalCorrect: result.correct ? 1 : 0,
              totalIncorrect: result.correct ? 0 : 1,
            },
          });

          wordUpdates.push({ wordId: result.wordId, levelBefore: null, levelAfter: newLevel, correct: result.correct });
        }
      }

      // 2. Calculate XP
      const correctCount =
        wordResults.length > 0
          ? wordResults.filter((r) => r.correct).length
          : totalScore;
      const multiplier = GAME_XP_MULTIPLIERS[gameType] ?? 1.0;
      const xpEarned = Math.round(correctCount * 10 * multiplier);

      // 3. Update UserLanguageStats
      const userLanguage = await prisma.userLanguage.findUnique({
        where: { userId_languageId: { userId, languageId: currentLanguageId } },
        include: { stats: true },
      });

      if (userLanguage?.stats) {
        const xpBefore = userLanguage.stats.xp;
        const xpAfter = xpBefore + xpEarned;
        const levelBefore = userLanguage.stats.level;
        const levelAfter = calculateLevel(xpAfter);

        await prisma.userLanguageStats.update({
          where: { id: userLanguage.stats.id },
          data: { xp: xpAfter, level: levelAfter },
        });

        // 4. Track activities
        await trackActivity(
          userId,
          currentLanguageId,
          ActivityType.PRACTICE_COMPLETED,
        );

        if (levelAfter > levelBefore) {
          await trackActivity(userId, currentLanguageId, ActivityType.LEVEL_UP);
        }

        return {
          xpEarned,
          xpBefore,
          xpAfter,
          levelBefore,
          levelAfter,
          leveledUp: levelAfter > levelBefore,
          wordUpdates,
        };
      }

      return {
        xpEarned,
        xpBefore: 0,
        xpAfter: xpEarned,
        levelBefore: 1,
        levelAfter: 1,
        leveledUp: false,
        wordUpdates,
      };
    }),

  getDueWords: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      return prisma.word.findMany({
        where: {
          userId: ctx.auth.user.id,
          languageId: ctx.auth.user.currentLanguageId,
          progress: { nextReviewAt: { lte: new Date() } },
        },
        include: { progress: true },
        take: input.limit,
        orderBy: { progress: { nextReviewAt: "asc" } },
      });
    }),

  getDueWordCount: protectedProcedure.query(async ({ ctx }) => {
    return prisma.word.count({
      where: {
        userId: ctx.auth.user.id,
        languageId: ctx.auth.user.currentLanguageId,
        progress: { nextReviewAt: { lte: new Date() } },
      },
    });
  }),
});
