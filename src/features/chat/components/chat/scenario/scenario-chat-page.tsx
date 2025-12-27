"use client"

import type { ChatWithUIMessages } from "@/features/chat/model/chat-model"
import type { Scenario } from "@/generated/prisma/client"
import React, { useState } from "react"
import {ChatInterface} from "@/features/chat/components/chat/chat-interface";
import {LearningTargetsSidebar} from "@/features/chat/components/chat/scenario/learning-targets-sidebar";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";

interface ScenarioChatPageProps {
    chat: ChatWithUIMessages
    scenario: Scenario
}

export default function ScenarioChatPage({ chat, scenario }: ScenarioChatPageProps) {
    const targets = scenario.targets
    const [targetsStatus, setTargetsStatus] = useState<boolean[]>(chat.targetsStatus)

    return (
        <ResizablePanelGroup
            direction="horizontal"
            className="flex flex-row items-stretch h-full w-full bg-gradient-to-br from-background to-muted/20 overflow-hidden"
        >
            <ResizablePanel defaultSize={75}>
                <ChatInterface
                    assistantName={chat.assistantName}
                    chatId={chat.id}
                    initialMessages={chat.messages}
                    onTargetsStatusChange={setTargetsStatus}
                />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={25}>
                <LearningTargetsSidebar targets={targets} targetsStatus={targetsStatus} />
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}
