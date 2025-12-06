import {useQueryStates} from "nuqs";
import {grammarParams} from "@/features/grammar/params";

export const useGrammarParams = () => {
    return useQueryStates(grammarParams)
}