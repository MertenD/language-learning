import {z} from "zod";

export const createCategorySchema = z.object({
    name: z.string().min(1),
    parentId: z.string().optional().nullable()
});