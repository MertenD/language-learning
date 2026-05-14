import {requireAuthAndPremium} from "@/lib/auth-utils"
import {createEmptyChat, loadChat} from "@/features/chat/server/chat-store"
import {redirect} from "next/navigation"
import {ChatInterface} from "@/features/chat/components/chat/chat-interface"
import AppHeader from "@/components/app-header"

export default async function ChatPage({params}: {params: Promise<{id: string}>}) {
    const session = await requireAuthAndPremium("/chat")
    const {id} = await params

    let chat

    if (id === "new") {
        const chatId = await createEmptyChat(session.user.id, session.user.currentLanguageId ?? "")
        redirect(`/chat/${chatId}`)
    } else {
        try {
            chat = await loadChat(id, session.user.id)
        } catch {
            redirect("/chat/new")
        }
    }

    // Scenario-linked chats were migrated to scenario_session — redirect to the new URL
    if (chat.scenarioId) {
        redirect(`/scenarios/${chat.id}`)
    }

    const breadcrumbs = [
        {title: "Chat", url: "/chat"},
        {title: chat.assistantName, url: `/chat/${chat.id}`},
    ]

    return (
        <>
            <AppHeader breadcrumbs={breadcrumbs} />
            <main className="flex-1 min-h-0">
                <div className="flex-1 h-full">
                    <ChatInterface assistantName={chat.assistantName} chatId={chat.id} initialMessages={chat.messages} />
                </div>
            </main>
        </>
    )
}
