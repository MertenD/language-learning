import {z} from "zod";

export const createGrammarSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1)
})

export type CreateGrammarInput = z.infer<typeof createGrammarSchema>