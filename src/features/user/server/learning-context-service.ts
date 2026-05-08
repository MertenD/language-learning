import prisma from "@/lib/db"

export type LearningContext = {
  level: number
  totalWords: number
  masteredWords: Array<{ primary: string; secondary: string }>
  learningWords: Array<{ primary: string; secondary: string }>
  grammarNotes: Array<{ title: string; summary: string }>
}

export async function getUserLearningContext(
  userId: string,
  languageId: string
): Promise<LearningContext> {
  const [vocabulary, grammar, userLanguage] = await Promise.all([
    prisma.word.findMany({
      where: { userId, languageId },
      include: { progress: true },
      orderBy: { updatedAt: "desc" },
      take: 300,
    }),
    prisma.grammar.findMany({
      where: { userId },
      select: { title: true, content: true },
      orderBy: { updatedAt: "desc" },
      take: 30,
    }),
    prisma.userLanguage.findUnique({
      where: { userId_languageId: { userId, languageId } },
      include: { stats: true },
    }),
  ])

  const masteredWords = vocabulary
    .filter(w => (w.progress?.level ?? 0) >= 3)
    .slice(0, 80)
    .map(w => ({ primary: w.primary, secondary: w.secondary }))

  const learningWords = vocabulary
    .filter(w => {
      const level = w.progress?.level ?? 0
      return level >= 1 && level <= 2
    })
    .slice(0, 30)
    .map(w => ({ primary: w.primary, secondary: w.secondary }))

  const grammarNotes = grammar.map(g => ({
    title: g.title,
    summary: g.content.slice(0, 150),
  }))

  return {
    level: userLanguage?.stats?.level ?? 1,
    totalWords: vocabulary.length,
    masteredWords,
    learningWords,
    grammarNotes,
  }
}
