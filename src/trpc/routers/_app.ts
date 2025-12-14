import {createTRPCRouter} from '../init';
import {wordsRouter} from "@/features/words/server/routers";
import {grammarRouter} from "@/features/grammar/server/routers";
import {chatsRouter} from "@/features/chat/server/routers";

export const appRouter = createTRPCRouter({
    words: wordsRouter,
    grammar: grammarRouter,
    chats: chatsRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;