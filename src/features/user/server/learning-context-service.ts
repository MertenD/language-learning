import prisma from "@/lib/db"

export type LearningContext = {
  level: number
  totalWords: number
  masteredWords: Array<{ primary: string; secondary: string }>
  learningWords: Array<{ primary: string; secondary: string }>
  newWords: Array<{ primary: string; secondary: string }>
  recentWords: Array<{ primary: string; secondary: string }>
  categories: Array<{ name: string; wordCount: number }>
  pastScenarioTitles: string[]
  grammarNotes: Array<{ title: string; summary: string }>
  languageName: string
}

export async function getUserLearningContext(
  userId: string,
  languageId: string
): Promise<LearningContext> {
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

  const [vocabulary, grammar, userLanguage, language, categories, pastScenarios] =
    await Promise.all([
      prisma.word.findMany({
        where: { userId, languageId },
        include: { progress: true },
        orderBy: { createdAt: "desc" },
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
      prisma.language.findUnique({ where: { id: languageId } }),
      prisma.wordCategory.findMany({
        where: { userId, languageId },
        include: { _count: { select: { words: true } } },
        orderBy: { words: { _count: "desc" } },
        take: 10,
      }),
      prisma.scenario.findMany({
        where: { userId, languageId, isAiGenerated: true },
        select: { title: true },
        orderBy: { generatedAt: "desc" },
        take: 5,
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
    .slice(0, 40)
    .map(w => ({ primary: w.primary, secondary: w.secondary }))

  // Words never practiced (no progress record or level 0)
  const newWords = vocabulary
    .filter(w => !w.progress || w.progress.level === 0)
    .slice(0, 50)
    .map(w => ({ primary: w.primary, secondary: w.secondary }))

  // Words added in the last 14 days regardless of progress
  const recentWords = vocabulary
    .filter(w => new Date(w.createdAt) >= twoWeeksAgo)
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
    newWords,
    recentWords,
    categories: categories.map(c => ({ name: c.name, wordCount: c._count.words })),
    pastScenarioTitles: pastScenarios.map(s => s.title),
    grammarNotes,
    languageName: language?.name ?? "",
  }
}
