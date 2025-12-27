"use client"

import type { ChatWithUIMessages } from "@/features/chat/model/chat-model"
import type { Scenario } from "@/generated/prisma/client"
import { useState } from "react"
import {ChatInterface} from "@/features/chat/components/chat/chat-interface";
import {LearningTargetsSidebar} from "@/features/chat/components/chat/scenario/learning-targets-sidebar";

interface ScenarioChatPageProps {
    chat: ChatWithUIMessages
    scenario: Scenario
}

export default function ScenarioChatPage({ chat, scenario }: ScenarioChatPageProps) {
    const targets = scenario.targets
    const [targetsStatus, setTargetsStatus] = useState<boolean[]>(chat.targetsStatus)

    return (
        <div className="flex flex-row items-stretch gap-4 h-full w-full bg-gradient-to-br from-background to-muted/20 overflow-hidden">
            <ChatInterface
                assistantName={chat.assistantName}
                chatId={chat.id}
                initialMessages={chat.messages}
                onTargetsStatusChange={setTargetsStatus}
            />
            <LearningTargetsSidebar targets={targets} targetsStatus={targetsStatus} />
        </div>
    )
}
