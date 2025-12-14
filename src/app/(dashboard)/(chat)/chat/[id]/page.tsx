import {requireAuth} from "@/lib/auth-utils";
import {createChat, loadChat} from "@/features/chat/server/chat-store";
import {redirect} from "next/navigation";
import {ChatInterface} from "@/features/chat/components/chat/chat-interface";

export default async function ChatPage({ params }: { params: { id: string } }) {
    const session = await requireAuth()
    const { id } = params

    let chat

    if (id === "new") {
        const chatId = await createChat(session.user.id)
        redirect(`/chat/${chatId}`)
    } else {
        try {
            chat = await loadChat(id, session.user.id)
        } catch {
            redirect("/chat/new")
        }
    }

    return (
        <main className="h-full p-4">
            <ChatInterface chatId={chat.id} initialMessages={chat.messages} />
        </main>
    )
}