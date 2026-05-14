import {createTRPCRouter} from '../init';
import {categoriesRouter, wordsRouter} from "@/features/words/server/routers";
import {grammarRouter} from "@/features/grammar/server/routers";
import {chatsRouter} from "@/features/chat/server/routers";
import {scenariosRouter, sessionsRouter} from "@/features/scenarios/server/routers";
import {userRouter} from "@/features/user/server/routers";
import {practiceRouter} from "@/features/practice/server/routers";

export const appRouter = createTRPCRouter({
    words: wordsRouter,
    categories: categoriesRouter,
    grammar: grammarRouter,
    chats: chatsRouter,
    scenarios: scenariosRouter,
    sessions: sessionsRouter,
    user: userRouter,
    practice: practiceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;