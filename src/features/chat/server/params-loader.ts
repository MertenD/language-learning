import {createLoader} from "nuqs/server";
import {chatsParams, scenariosParams} from "@/features/chat/params";

export const chatsParamsLoader = createLoader(chatsParams)

export const scenariosParamsLoader = createLoader(scenariosParams)