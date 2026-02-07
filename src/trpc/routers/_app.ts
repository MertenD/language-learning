import {createTRPCRouter} from '../init';
import {categoriesRouter, wordsRouter} from "@/features/words/server/routers";
import {grammarRouter} from "@/features/grammar/server/routers";
import {chatsRouter, scenariosRouter} from "@/features/chat/server/routers";
import {userRouter} from "@/features/user/server/routers";

export const appRouter = createTRPCRouter({
    words: wordsRouter,
    categories: categoriesRouter,
    grammar: grammarRouter,
    chats: chatsRouter,
    scenarios: scenariosRouter,
    user: userRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;