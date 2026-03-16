import {z} from "zod";

export const createWordSchema = z.object({
    primary: z.string().min(1),
    primaryInfo: z.string().optional(),
    secondary: z.string().min(1),
    secondaryInfo: z.string().optional(),
    categoryId: z.string().optional().nullable()
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