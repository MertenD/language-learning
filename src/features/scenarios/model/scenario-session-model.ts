import {UIMessage} from "ai";
import {ScenarioSession} from "@/generated/prisma/client";

export type ScenarioSessionWithUIMessages = Omit<ScenarioSession, 'messages'> & {
    messages: UIMessage[]
}
