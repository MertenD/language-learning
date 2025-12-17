import {requireAuthAndPremium} from "@/lib/auth-utils";
import {createEmptyChat, loadChat} from "@/features/chat/server/chat-store";
import {redirect} from "next/navigation";
import {ChatInterface} from "@/features/chat/components/chat/chat-interface";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await requireAuthAndPremium("/chat")
    const { id } = await params

    let chat

    if (id === "new") {
        const chatId = await createEmptyChat(session.user.id)
        redirect(`/chat/${chatId}`)
    } else {
        try {
            chat = await loadChat(id, session.user.id)
        } catch {
            redirect("/chat/new")
        }
    }

    return (
        <main className="h-full">
            <ChatInterface chatId={chat.id} initialMessages={chat.messages} />
        </main>
    )
}