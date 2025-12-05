import {useQueryStates} from "nuqs";
import {wordsParams} from "@/features/words/params";

export const useWordsParams = () => {
    return useQueryStates(wordsParams)
}