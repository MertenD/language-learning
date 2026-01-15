"use client"

import React, { useState } from "react"
import { ChatInterface } from "@/features/chat/components/chat/chat-interface"
import { LearningTargetsSidebar } from "@/features/chat/components/chat/scenario/learning-targets-sidebar"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Target } from "lucide-react"
import {ChatWithUIMessages} from "@/features/chat/model/chat-model";
import {Scenario} from "@/generated/prisma/client";

interface ScenarioChatPageProps {
    chat: ChatWithUIMessages
    scenario: Scenario
}

export default function ScenarioChatPage({ chat, scenario }: ScenarioChatPageProps) {
    const targets = scenario.targets
    const [targetsStatus, setTargetsStatus] = useState<boolean[]>(chat.targetsStatus)

    const done = targetsStatus?.filter(Boolean).length ?? 0
    const total = targets.length

    return (
        <div className="h-full w-full overflow-hidden">
            {/* Mobile layout */}
            <div className="flex h-full flex-col md:hidden">
                <ChatInterface
                    assistantName={chat.assistantName}
                    chatId={chat.id}
                    initialMessages={chat.messages}
                    onTargetsStatusChange={setTargetsStatus}
                    chatHeaderTail={<div className="sticky top-0 z-10 flex items-center justify-end gap-2 bg-background/80 backdrop-blur p-2">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="default" className="gap-2">
                                    <Target className="h-4 w-4" />
                                    Lernziele
                                    <span className="text-xs text-muted-foreground">({done}/{total})</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[90vw] sm:w-[420px] p-0">
                                <SheetHeader className="p-4 pb-2">
                                    <SheetTitle>Lernziele</SheetTitle>
                                </SheetHeader>
                                <LearningTargetsSidebar targets={targets} targetsStatus={targetsStatus} />
                            </SheetContent>
                        </Sheet>
                    </div>}
                />
            </div>

            {/* Desktop layout */}
            <ResizablePanelGroup
                direction="horizontal"
                className="hidden md:flex h-full w-full bg-linear-to-br from-background to-muted/20 overflow-hidden"
            >
                <ResizablePanel defaultSize={75} className="min-w-0">
                    <ChatInterface
                        assistantName={chat.assistantName}
                        chatId={chat.id}
                        initialMessages={chat.messages}
                        onTargetsStatusChange={setTargetsStatus}
                    />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={25} className="min-w-[280px]">
                    <LearningTargetsSidebar targets={targets} targetsStatus={targetsStatus} />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
