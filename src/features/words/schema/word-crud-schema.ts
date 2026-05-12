import {z} from "zod";

export const wordTypeSchema = z.enum(["noun", "verb", "adjective", "phrase", "other"])
export type WordType = z.infer<typeof wordTypeSchema>

export const WORD_TYPE_LABELS: Record<WordType, string> = {
    noun: "Noun",
    verb: "Verb",
    adjective: "Adj.",
    phrase: "Phrase",
    other: "Other",
}

export const WORD_TYPE_COLORS: Record<WordType, string> = {
    noun: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    verb: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    adjective: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    phrase: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
    other: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
}

export const wordFormsSchema = z.object({
    // Noun
    gender: z.string().optional(),
    plural: z.string().optional(),
    // Verb — key forms
    firstPersonSingular: z.string().optional(),
    secondPersonSingular: z.string().optional(),
    thirdPersonSingular: z.string().optional(),
    firstPersonPlural: z.string().optional(),
    secondPersonPlural: z.string().optional(),
    thirdPersonPlural: z.string().optional(),
    pastTense: z.string().optional(),
    pastParticiple: z.string().optional(),
    auxiliary: z.string().optional(),
    // Adjective
    comparative: z.string().optional(),
    superlative: z.string().optional(),
    feminineForm: z.string().optional(),
}).optional()

export type WordForms = z.infer<typeof wordFormsSchema>

export const createWordSchema = z.object({
    primary: z.string().min(1),
    primaryInfo: z.string().optional(),
    secondary: z.string().min(1),
    secondaryInfo: z.string().optional(),
    categoryId: z.string().optional().nullable(),
    examples: z.array(z.string()).optional(),
    wordType: wordTypeSchema.optional(),
    forms: wordFormsSchema,
})

export const csvWordSchema = z.object({
    primary: z.string().min(1, "Primary word is required"),
    primaryInfo: z.string().optional(),
    secondary: z.string().min(1, "Secondary word is required"),
    secondaryInfo: z.string().optional(),
    examples: z.string().optional()
})

export type CsvWordInput = z.infer<typeof csvWordSchema>

export type CreateWordInput = z.infer<typeof createWordSchema>
