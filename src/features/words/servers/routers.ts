import {createTRPCRouter, premiumProcedure, protectedProcedure} from "@/trpc/init";
import prisma from "@/lib/db";
import {z} from "zod";

export const wordsRouter = createTRPCRouter({
    create: premiumProcedure
        .input(z.object({
            german: z.string().min(1),
            germanInfo: z.string().min(1).optional(),
            serbian: z.string().min(1),
            serbianInfo: z.string().min(1).optional()
        }))
        .mutation(({ ctx, input }) => {
            return prisma.word.create({
                data: {
                    german: input.german,
                    germanInfo: input.germanInfo,
                    serbian: input.serbian,
                    serbianInfo: input.serbianInfo,
                    userId: ctx.auth.user.id
                }
            })
    }),
    remove: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(({ ctx, input }) => {
            return prisma.word.delete({
                where: { id: input.id, userId: ctx.auth.user.id }
            })
    }),
    update: premiumProcedure
        .input(z.object({
            id: z.string().min(1),
            german: z.string().min(1).optional(),
            germanInfo: z.string().min(1).optional(),
            serbian: z.string().min(1).optional(),
            serbianInfo: z.string().min(1).optional()
        }))
        .mutation(({ ctx, input }) => {
            return prisma.word.update({
                where: { id: input.id, userId: ctx.auth.user.id },
                data: {
                    german: input.german,
                    germanInfo: input.germanInfo,
                    serbian: input.serbian,
                    serbianInfo: input.serbianInfo,
                }
            })
        }),
    getOne: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .query(({ ctx, input }) => {
            return prisma.word.findUnique({
                where: { id: input.id, userId: ctx.auth.user.id }
            })
        }),
    getMany: protectedProcedure
        .query(({ ctx }) => {
            return prisma.word.findMany({
                where: { userId: ctx.auth.user.id }
            })
        })
})