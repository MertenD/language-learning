import {useQueryStates} from "nuqs";
import {scenariosParams} from "@/features/chat/params";

export const useScenariosParams = () => {
    return useQueryStates(scenariosParams)
}

