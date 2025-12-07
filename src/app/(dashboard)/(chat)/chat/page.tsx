import {redirect} from "next/navigation"
import {createChat, loadChat} from "@/features/chat/server/chat-store"
import {ChatInterface} from "@/features/chat/components/chat-interface"
import {requireAuth} from "@/lib/auth-utils";

export default async function ChatPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>
}) {
    const session = await requireAuth()
    const { id } = await searchParams

    let chat

    if (!id || id === "new") {
        const chatId = await createChat(session.user.id)
        redirect(`/chat?id=${chatId}`)
    } else {
        try {
            chat = await loadChat(id, session.user.id)
        } catch {
            redirect("/chat?id=new")
        }
    }

    return (
        <main className="h-full p-4">
            <ChatInterface chatId={chat.id} initialMessages={chat.messages} />
        </main>
    )
}

