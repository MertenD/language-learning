import {useQueryStates} from "nuqs";
import {grammarParams} from "@/features/grammar/params";
import {chatsParams} from "@/features/chat/params";

export const useChatsParams = () => {
    return useQueryStates(chatsParams)
}