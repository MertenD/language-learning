import {UIMessage} from "ai";

export function getTextFromMessage(message: UIMessage): string {
    return message.parts
        ?.map((p) => (p.type === "text" ? p.text : ""))
        .join("") ?? ""
}