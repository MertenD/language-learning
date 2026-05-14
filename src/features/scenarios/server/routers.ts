import {createTRPCRouter, premiumProcedure, protectedProcedure} from "@/trpc/init";
import prisma from "@/lib/db";
import {z} from "zod";
import {PAGINATION} from "@/config/constants";
import {TRPCError} from "@trpc/server";
import {generateObject} from "ai";
import {openrouter, AI_MODEL} from "@/lib/ai";
import {getUserLearningContext} from "@/features/user/server/learning-context-service";
import {trackActivity} from "@/features/user/server/activity-service";
import {ActivityType} from "@/features/dashboard/model/activity-type";
import {createSessionFromScenario, loadSession} from "@/features/scenarios/server/session-store";

export const scenariosRouter = createTRPCRouter({
    getMany: protectedProcedure
        .input(z.object({
            page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
            pageSize: z.number().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE),
            search: z.string().default("")
        }))
        .query(async ({ctx, input}) => {
            const {page, pageSize, search} = input;

            const [items, totalCount] = await Promise.all([
                prisma.scenario.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where: {
                        languageId: ctx.auth.user.currentLanguageId,
                        userId: null,
                        title: {contains: search, mode: "insensitive"}
                    },
                    orderBy: {updatedAt: "desc"}
                }),
                prisma.scenario.count({
                    where: {
                        languageId: ctx.auth.user.currentLanguageId,
                        userId: null,
                        title: {contains: search, mode: "insensitive"}
                    },
                })
            ])

            const totalPages = Math.ceil(totalCount / pageSize);
            return {
                items,
                page,
                pageSize,
                totalCount,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        }),

    getAiSuggestions: protectedProcedure.query(async ({ctx}) => {
        return prisma.scenario.findMany({
            where: {
                userId: ctx.auth.user.id,
                languageId: ctx.auth.user.currentLanguageId,
                isAiGenerated: true,
            },
            orderBy: {generatedAt: "desc"},
        })
    }),

    getUserScenarios: protectedProcedure.query(async ({ctx}) => {
        return prisma.scenario.findMany({
            where: {
                userId: ctx.auth.user.id,
                languageId: ctx.auth.user.currentLanguageId,
                isUserCreated: true,
            },
            orderBy: {updatedAt: "desc"},
        })
    }),

    generateForUser: premiumProcedure
        .input(z.object({force: z.boolean().default(false)}))
        .mutation(async ({ctx, input}) => {
            const {id: userId, currentLanguageId} = ctx.auth.user

            if (!input.force) {
                const cached = await prisma.scenario.findFirst({
                    where: {userId, isAiGenerated: true, languageId: currentLanguageId},
                    orderBy: {generatedAt: "desc"},
                })
                if (cached?.generatedAt) {
                    const ageMs = Date.now() - cached.generatedAt.getTime()
                    if (ageMs < 24 * 60 * 60 * 1000) {
                        return prisma.scenario.findMany({
                            where: {userId, isAiGenerated: true, languageId: currentLanguageId},
                        })
                    }
                }
            }

            const [learningContext, currentLanguage] = await Promise.all([
                getUserLearningContext(userId, currentLanguageId),
                prisma.language.findUnique({where: {id: currentLanguageId}}),
            ])

            if (!currentLanguage) {
                throw new TRPCError({code: "BAD_REQUEST", message: "Language not found"})
            }

            const fmt = (words: Array<{primary: string; secondary: string}>, max = 60) =>
                words.length > 0
                    ? words.slice(0, max).map(w => `${w.primary} → ${w.secondary}`).join(", ")
                    : "keine"

            const categoriesText = learningContext.categories.length > 0
                ? learningContext.categories.map(c => `${c.name} (${c.wordCount} Wörter)`).join(", ")
                : "keine Ordner angelegt"

            const pastTitlesText = learningContext.pastScenarioTitles.length > 0
                ? learningContext.pastScenarioTitles.join(", ")
                : "keine"

            const {object} = await generateObject({
                model: openrouter(AI_MODEL),
                schema: z.object({
                    scenarios: z.array(z.object({
                        type: z.enum(["consolidation", "stretch"]),
                        title: z.string().describe("Kurzer prägnanter Titel des Szenarios"),
                        description: z.string().describe("1-2 Sätze Beschreibung was in diesem Szenario passiert"),
                        image: z.string().describe("NUR ein einzelnes Emoji-Zeichen (z.B. 🍕, 🏥, ✈️) — KEINE URLs, KEINE Wörter, KEIN Text, ausschließlich ein Emoji"),
                        assistantName: z.string().describe("Name des Gesprächspartners (z.B. 'Maria', 'Kellner', 'Arzt')"),
                        assistantInstructions: z.string().describe("Kurze Systemanweisung für den Assistenten: welche Rolle spielt er, wie verhält er sich"),
                        firstAssistantMessage: z.string().describe(`Erste Nachricht MUSS exakt diesem XML-Format folgen — keine Ausnahmen, keine Markdown-Formatierung außerhalb der Tags:
<CONVERSATION>
[Gesprächseröffnung AUSSCHLIESSLICH auf ${currentLanguage.name} — max. 1-2 kurze Sätze, strikt dem CEFR-Level des Szenarios entsprechend. KEINE deutschen Wörter, KEINE Übersetzungen, KEINE Erklärungen in Klammern — ausschließlich reiner Zielsprachentext. A1: max. 5–6 Wörter pro Satz, nur Präsens, einfachste Alltagswörter. A2: max. 8–10 Wörter. B1+: steigend komplexer.]
</CONVERSATION>
<EXPLANATION>
[Deutsche Übersetzung des CONVERSATION-Texts + 2-3 neue Vokabeln mit Bedeutung. ALLE Übersetzungen gehören hierher — NIEMALS in den CONVERSATION-Tag.]
</EXPLANATION>
<EXAMPLE_ANSWERS>
[3 mögliche Antworten auf ${currentLanguage.name}, jeweils mit deutscher Übersetzung in Klammern, ebenfalls dem CEFR-Level entsprechend]
</EXAMPLE_ANSWERS>
<GOALS_STATUS>
[JSON-Array mit genau so vielen false-Einträgen wie targets, z.B. [false, false, false] für 3 targets]
</GOALS_STATUS>`),
                        targets: z.array(z.string()).min(2).max(5).describe(
                            "Konkrete handlungsbasierte Ziele — NICHT vage Fähigkeiten wie 'Höflichkeitsformen nutzen' oder 'Wortschatz erweitern'. " +
                            "STATTDESSEN: Spezifische Aktion die der Nutzer im Gespräch ausführen soll. " +
                            `Beispiele für ${currentLanguage.name}: ` +
                            "'Frage nach einem freien Tisch für zwei', " +
                            "'Bestelle ein Hauptgericht mit Mengenangabe', " +
                            "'Reklamiere eine falsche Bestellung', " +
                            "'Bitte um die Rechnung'"
                        ),
                        level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).describe("CEFR-Level passend zum Nutzerprofil"),
                        tags: z.array(z.string()).min(1).max(3).describe("1–3 Grammatik- oder Themenschwerpunkte wie 'Vergangenheit', 'Konjugation', 'Präpositionen'"),
                    }))
                }),
                prompt: `Erstelle 5 Konversationsszenarien zum Üben von ${currentLanguage.name}. Nutze für das Image ausschließlich ein Emoji, nichts anderes.

LERNSTAND DES NUTZERS:
- CEFR-Level: ${learningContext.level} (Gesamtvokabular: ${learningContext.totalWords} Wörter)
- Grammatik: ${learningContext.grammarNotes.map(g => g.title).join(", ") || "keine gespeichert"}

VOKABULAR-STATUS:
- Neu hinzugefügt, noch nicht geübt (${learningContext.newWords.length} Wörter): ${fmt(learningContext.newWords, 50)}
- Gerade am Lernen, Level 1–2 (${learningContext.learningWords.length} Wörter): ${fmt(learningContext.learningWords, 40)}
- Gefestigt, Level 3–5 (${learningContext.masteredWords.length} Wörter): ${fmt(learningContext.masteredWords, 40)}
- Zuletzt hinzugefügt (letzte 2 Wochen): ${fmt(learningContext.recentWords, 30)}

VOKABEL-ORDNER DES NUTZERS (nach Größe):
${categoriesText}

BEREITS GENERIERTE SZENARIEN (diese Themen bitte nicht wiederholen):
${pastTitlesText}

AUFTRAG — GENAU 5 SZENARIEN:
- 3 "consolidation" Szenarien: Szenarien, in denen die Wörter aus "Neu hinzugefügt" und "Gerade am Lernen" auf natürliche Weise vorkommen und geübt werden.
  WICHTIG: Wenn Vokabel-Ordner existieren (z.B. "Badezimmer", "Reisen"), baue mindestens ein Szenario direkt um dieses Thema — die Wörter des Ordners sollen im Gespräch konkret vorkommen.
- 2 "stretch" Szenarien: Neue Themen passend zum Niveau, die noch nicht im Vokabular abgedeckt sind.

LEVEL-ZUWEISUNG (CEFR):
- consolidation-Szenarien: aktuelles Level (${learningContext.level}) oder eine Stufe darunter
- stretch-Szenarien: eine Stufe über dem aktuellen Level

TAGS:
- Wähle 1–3 Grammatik- oder Themenschwerpunkte die in diesem Szenario natürlich vorkommen (z.B. "Vergangenheit", "Konjugation", "Präpositionen", "Adjektive", "Fragen")

REGELN:
- Szenarien sollen realistisch und motivierend sein
- Gesprächspartner hat einen passenden echten Namen
- firstAssistantMessage MUSS das XML-Format (<CONVERSATION>, <EXPLANATION>, <EXAMPLE_ANSWERS>, <GOALS_STATUS>) exakt einhalten — kein reiner Text
- GOALS_STATUS enthält genau so viele false-Einträge wie targets definiert sind
- targets sind KONKRETE Aktionen (z.B. "Frage nach einem freien Tisch für zwei"), KEINE vagen Fähigkeitsbeschreibungen
- Nicht zu einfach, nicht zu schwer — herausfordernd aber erreichbar
- SPRACHNIVEAU im CONVERSATION-Tag: MUSS dem CEFR-Level des Szenarios entsprechen. A1 = max. 5–6 Wörter/Satz, nur Präsens, Grundvokabular. A2 = max. 8–10 Wörter, einfache Vergangenheit. B1 = mittelkomplexe Sätze. B2+ = steigend komplexer.
- KONVERSATIONSSPRACHE: Das CONVERSATION-Tag enthält AUSSCHLIESSLICH ${currentLanguage.name} — keine deutschen Wörter, keine Übersetzungen, keine Klammern mit Erklärungen. Alle deutschen Inhalte kommen ausschließlich in den EXPLANATION-Tag`,
            })

            await prisma.scenario.deleteMany({
                where: {userId, isAiGenerated: true, languageId: currentLanguageId},
            })

            const now = new Date()
            return Promise.all(
                object.scenarios.map(s =>
                    prisma.scenario.create({
                        data: {
                            title: s.title,
                            description: s.description,
                            image: s.image,
                            assistantName: s.assistantName,
                            assistantInstructions: s.assistantInstructions,
                            firstAssistantMessage: s.firstAssistantMessage,
                            targets: s.targets,
                            level: s.level,
                            tags: s.tags,
                            languageId: currentLanguageId,
                            userId,
                            isAiGenerated: true,
                            generatedAt: now,
                        },
                    })
                )
            )
        }),

    generateSingle: premiumProcedure
        .input(z.object({prompt: z.string().min(1).max(1000)}))
        .mutation(async ({ctx, input}) => {
            const {id: userId, currentLanguageId} = ctx.auth.user

            const [learningContext, currentLanguage] = await Promise.all([
                getUserLearningContext(userId, currentLanguageId),
                prisma.language.findUnique({where: {id: currentLanguageId}}),
            ])

            if (!currentLanguage) {
                throw new TRPCError({code: "BAD_REQUEST", message: "Language not found"})
            }

            const fmt = (words: Array<{primary: string; secondary: string}>, max = 40) =>
                words.length > 0
                    ? words.slice(0, max).map(w => `${w.primary} → ${w.secondary}`).join(", ")
                    : "keine"

            const categoriesText = learningContext.categories.length > 0
                ? learningContext.categories.map(c => `${c.name} (${c.wordCount} Wörter)`).join(", ")
                : "keine Ordner angelegt"

            const {object} = await generateObject({
                model: openrouter(AI_MODEL),
                schema: z.object({
                    title: z.string().describe("Kurzer prägnanter Titel des Szenarios"),
                    description: z.string().describe("1-2 Sätze Beschreibung was in diesem Szenario passiert"),
                    image: z.string().describe("NUR ein einzelnes Emoji-Zeichen (z.B. 🍕, 🏥, ✈️) — KEINE URLs, KEINE Wörter, KEIN Text, ausschließlich ein Emoji"),
                    assistantName: z.string().describe("Name des Gesprächspartners (z.B. 'Maria', 'Kellner', 'Arzt')"),
                    assistantInstructions: z.string().describe("Systemanweisung für den Assistenten: welche Rolle spielt er, wie verhält er sich"),
                    firstAssistantMessage: z.string().describe(`Erste Nachricht MUSS exakt diesem XML-Format folgen — keine Ausnahmen, keine Markdown-Formatierung außerhalb der Tags:
<CONVERSATION>
[Gesprächseröffnung AUSSCHLIESSLICH auf ${currentLanguage.name} — max. 1-2 kurze Sätze, strikt dem CEFR-Level des Szenarios entsprechend. KEINE deutschen Wörter, KEINE Übersetzungen, KEINE Erklärungen in Klammern — ausschließlich reiner Zielsprachentext. A1: max. 5–6 Wörter pro Satz, nur Präsens, einfachste Alltagswörter. A2: max. 8–10 Wörter. B1+: steigend komplexer.]
</CONVERSATION>
<EXPLANATION>
[Deutsche Übersetzung des CONVERSATION-Texts + 2-3 neue Vokabeln mit Bedeutung. ALLE Übersetzungen gehören hierher — NIEMALS in den CONVERSATION-Tag.]
</EXPLANATION>
<EXAMPLE_ANSWERS>
[3 mögliche Antworten auf ${currentLanguage.name}, jeweils mit deutscher Übersetzung in Klammern, ebenfalls dem CEFR-Level entsprechend]
</EXAMPLE_ANSWERS>
<GOALS_STATUS>
[JSON-Array mit genau so vielen false-Einträgen wie targets, z.B. [false, false, false] für 3 targets]
</GOALS_STATUS>`),
                    targets: z.array(z.string()).min(2).max(5).describe(
                        "Konkrete handlungsbasierte Ziele — NICHT vage Fähigkeiten wie 'Höflichkeitsformen nutzen' oder 'Wortschatz erweitern'. " +
                        "STATTDESSEN: Spezifische Aktion + erwartete Phrase oder Vokabel. " +
                        `Beispiele für ${currentLanguage.name}: ` +
                        "'Frage nach einem freien Tisch mit einer konkreten Floskel', " +
                        "'Bestelle ein Gericht und nenne eine Mengenangabe', " +
                        "'Reklamiere höflich und nenne einen Grund', " +
                        "'Verabschiede dich und bedanke dich für den Service'"
                    ),
                    level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).describe("CEFR-Level passend zum Nutzerprofil und dem Szenario"),
                    tags: z.array(z.string()).min(1).max(3).describe("1–3 Grammatik- oder Themenschwerpunkte"),
                }),
                prompt: `Erstelle ein einzelnes Konversationsszenario zum Üben von ${currentLanguage.name}. Nutze für das Image ausschließlich ein einzelnes Emoji, nichts anderes.

LERNSTAND DES NUTZERS:
- CEFR-Level: ${learningContext.level} (Gesamtvokabular: ${learningContext.totalWords} Wörter)
- Grammatik: ${learningContext.grammarNotes.map(g => g.title).join(", ") || "keine gespeichert"}

VOKABULAR-STATUS:
- Neu hinzugefügt, noch nicht geübt: ${fmt(learningContext.newWords)}
- Gerade am Lernen (Level 1–2): ${fmt(learningContext.learningWords)}
- Gefestigt (Level 3–5): ${fmt(learningContext.masteredWords)}
- Zuletzt hinzugefügt (letzte 2 Wochen): ${fmt(learningContext.recentWords)}

VOKABEL-ORDNER DES NUTZERS:
${categoriesText}

NUTZERWUNSCH:
${input.prompt}

REGELN:
- Orientiere dich stark am Nutzerwunsch, nutze aber die Vokabeln aus "Neu hinzugefügt" und "Gerade am Lernen" als Basis
- Falls der Nutzerwunsch zu einem Vokabel-Ordner passt (z.B. "Badezimmer"), beziehe die entsprechenden Wörter aktiv ein
- Gesprächspartner hat einen passenden echten Namen
- firstAssistantMessage MUSS das XML-Format (<CONVERSATION>, <EXPLANATION>, <EXAMPLE_ANSWERS>, <GOALS_STATUS>) exakt einhalten — kein reiner Text
- GOALS_STATUS enthält genau so viele false-Einträge wie targets definiert sind
- targets sind KONKRETE Aktionen (z.B. "Frage nach einem freien Tisch für zwei"), KEINE vagen Fähigkeitsbeschreibungen
- Level passend zum Nutzerprofil und der Schwierigkeit des Szenarios wählen
- SPRACHNIVEAU im CONVERSATION-Tag: MUSS dem CEFR-Level des Szenarios entsprechen. A1 = max. 5–6 Wörter/Satz, nur Präsens, Grundvokabular. A2 = max. 8–10 Wörter, einfache Vergangenheit. B1 = mittelkomplexe Sätze. B2+ = steigend komplexer.
- KONVERSATIONSSPRACHE: Das CONVERSATION-Tag enthält AUSSCHLIESSLICH ${currentLanguage.name} — keine deutschen Wörter, keine Übersetzungen, keine Klammern mit Erklärungen. Alle deutschen Inhalte kommen ausschließlich in den EXPLANATION-Tag`,
            })

            return object
        }),

    createUserScenario: premiumProcedure
        .input(z.object({
            title: z.string().min(1).max(100),
            description: z.string().min(1).max(500),
            image: z.string().min(1).max(10),
            assistantName: z.string().min(1).max(50),
            assistantInstructions: z.string().min(1),
            firstAssistantMessage: z.string().min(1),
            targets: z.array(z.string().min(1)).min(1).max(10),
            level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
            tags: z.array(z.string()).default([]),
        }))
        .mutation(async ({ctx, input}) => {
            return prisma.scenario.create({
                data: {
                    ...input,
                    userId: ctx.auth.user.id,
                    languageId: ctx.auth.user.currentLanguageId,
                    isUserCreated: true,
                },
            })
        }),

    updateUserScenario: premiumProcedure
        .input(z.object({
            id: z.string().min(1),
            title: z.string().min(1).max(100),
            description: z.string().min(1).max(500),
            image: z.string().min(1).max(10),
            assistantName: z.string().min(1).max(50),
            assistantInstructions: z.string().min(1),
            firstAssistantMessage: z.string().min(1),
            targets: z.array(z.string().min(1)).min(1).max(10),
            level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
            tags: z.array(z.string()).default([]),
        }))
        .mutation(async ({ctx, input}) => {
            const {id, ...data} = input
            return prisma.scenario.update({
                where: {id, userId: ctx.auth.user.id},
                data,
            })
        }),

    saveAiScenario: premiumProcedure
        .input(z.object({id: z.string().min(1)}))
        .mutation(async ({ctx, input}) => {
            const source = await prisma.scenario.findUnique({
                where: {id: input.id, userId: ctx.auth.user.id, isAiGenerated: true},
            })
            if (!source) {
                throw new TRPCError({code: "NOT_FOUND", message: "Scenario not found"})
            }
            return prisma.scenario.create({
                data: {
                    title: source.title,
                    description: source.description,
                    image: source.image,
                    assistantName: source.assistantName,
                    assistantInstructions: source.assistantInstructions,
                    firstAssistantMessage: source.firstAssistantMessage,
                    targets: source.targets,
                    level: source.level,
                    tags: source.tags,
                    languageId: source.languageId,
                    userId: ctx.auth.user.id,
                    isUserCreated: true,
                },
            })
        }),

    removeUserScenario: protectedProcedure
        .input(z.object({id: z.string().min(1)}))
        .mutation(async ({ctx, input}) => {
            return prisma.scenario.delete({
                where: {id: input.id, userId: ctx.auth.user.id},
            })
        }),
})

export const sessionsRouter = createTRPCRouter({
    createFromScenario: premiumProcedure
        .input(z.object({scenarioId: z.string()}))
        .mutation(async ({ctx, input}) => {
            const nativeLanguage = await prisma.language.findUnique({
                where: {id: ctx.auth.user.nativeLanguageId}
            })
            const sessionId = await createSessionFromScenario({
                scenarioId: input.scenarioId,
                userId: ctx.auth.user.id,
                nativeLanguageName: nativeLanguage?.name ?? "Deutsch",
            })
            await trackActivity(ctx.auth.user.id, ctx.auth.user.currentLanguageId, ActivityType.SCENARIO_STARTED)
            return sessionId
        }),

    remove: protectedProcedure
        .input(z.object({id: z.string()}))
        .mutation(({ctx, input}) => {
            return prisma.scenarioSession.delete({
                where: {id: input.id, userId: ctx.auth.user.id}
            })
        }),

    loadSession: protectedProcedure
        .input(z.object({sessionId: z.string()}))
        .query(async ({ctx, input}) => {
            return loadSession(input.sessionId, ctx.auth.user.id)
        }),

    getMany: protectedProcedure
        .input(z.object({
            page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
            pageSize: z.number().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE),
        }))
        .query(async ({ctx, input}) => {
            const {page, pageSize} = input

            const [items, totalCount] = await Promise.all([
                prisma.scenarioSession.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where: {
                        userId: ctx.auth.user.id,
                        languageId: ctx.auth.user.currentLanguageId,
                    },
                    include: {scenario: {select: {title: true, image: true, level: true}}},
                    orderBy: {updatedAt: "desc"},
                }),
                prisma.scenarioSession.count({
                    where: {
                        userId: ctx.auth.user.id,
                        languageId: ctx.auth.user.currentLanguageId,
                    },
                }),
            ])

            const totalPages = Math.ceil(totalCount / pageSize)
            return {
                items,
                page,
                pageSize,
                totalCount,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            }
        }),
})
