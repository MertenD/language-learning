import {createTRPCRouter} from '../init';
import {wordsRouter} from "@/features/words/servers/routers";

export const appRouter = createTRPCRouter({
    words: wordsRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;