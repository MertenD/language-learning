import {requireAuthAndPremium} from "@/lib/auth-utils";
import {createEmptyChat, loadChat} from "@/features/chat/server/chat-store";
import {redirect} from "next/navigation";
import {ChatInterface} from "@/features/chat/components/chat/chat-interface";
import ScenarioChatPage from "@/features/chat/components/chat/scenario-chat-page";
import prisma from "@/lib/db";

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

    if (chat.scenarioId) {
        const scenario = await prisma.scenario.findUnique({
            where: { id: chat.scenarioId }
        })

        if (!scenario) {
            // TODO Add better component for this case
            return <div>
                Scenario not found.
            </div>
        }

        return <main className="h-full">
            <ScenarioChatPage chat={chat} scenario={scenario} />
        </main>
    }

    return (
        <main className="h-full">
            <ChatInterface assistantName={chat.assistantName} chatId={chat.id} initialMessages={chat.messages} />
        </main>
    )
}