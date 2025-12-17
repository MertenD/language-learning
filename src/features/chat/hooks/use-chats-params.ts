import {useQueryStates} from "nuqs";
import {chatsParams} from "@/features/chat/params";

export const useChatsParams = () => {
    return useQueryStates(chatsParams)
}