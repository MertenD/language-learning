import {z} from "zod";

export const createWordSchema = z.object({
    german: z.string().min(1),
    germanInfo: z.string().optional(),
    serbian: z.string().min(1),
    serbianInfo: z.string().optional(),
    categoryId: z.string().optional().nullable()
})

export type CreateWordInput = z.infer<typeof createWordSchema>