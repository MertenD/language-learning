import {baseProcedure, createTRPCRouter, premiumProcedure, protectedProcedure} from '../init';
import prisma from "@/lib/db";
import {inngest} from "@/inngest/client";
import {InngestEvents} from "@/inngest/functions";

export const appRouter = createTRPCRouter({
    getUser: protectedProcedure
        .query(({ ctx }) => {
            return prisma.user.findMany({
                where: {
                    id: ctx.auth.user.id
                }
            })
        }),
    inngestHelloWorld: baseProcedure
        .mutation(async () => {
            await inngest.send({
                name: InngestEvents.TestHelloWorld,
                data: {
                    email: "merten.dieckmann@web.de"
                }
            })

            return { success: true, message: "Job queued" }
        }),
    testAI: premiumProcedure.mutation(async () => {
        await inngest.send({
            name: InngestEvents.ExecuteAI
        })

        return { success: true, message: "Job queued" }
    })
});

// export type definition of API
export type AppRouter = typeof appRouter;