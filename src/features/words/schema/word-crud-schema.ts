import {z} from "zod";

export const createWordSchema = z.object({
    primary: z.string().min(1),
    primaryInfo: z.string().optional(),
    secondary: z.string().min(1),
    secondaryInfo: z.string().optional(),
    categoryId: z.string().optional().nullable()
})

export type CreateWordInput = z.infer<typeof createWordSchema>