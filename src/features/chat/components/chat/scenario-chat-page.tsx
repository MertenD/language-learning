"use client"

import {ChatInterface} from "@/features/chat/components/chat/chat-interface";
import {ChatWithUIMessages} from "@/features/chat/model/chat-model";
import {Scenario} from "@/generated/prisma/client";
import {useState} from "react";
import {cn} from "@/lib/utils";

interface ScenarioChatPageProps {
    chat: ChatWithUIMessages
    scenario: Scenario
}

export default function ScenarioChatPage({ chat, scenario }: ScenarioChatPageProps) {

    const targets = scenario.targets
    const [targetsStatus, setTargetsStatus] = useState<boolean[]>(chat.targetsStatus)
    
    return <div className="flex flex-row items-center gap-2 h-full w-full">
        <ChatInterface
            assistantName={chat.assistantName}
            chatId={chat.id}
            initialMessages={chat.messages}
            onTargetsStatusChange={setTargetsStatus}
        />
        <div className="flex flex-col gap-2 p-2">
            {targets.map((target, index) => (
                <div key={index} className={cn(
                    "p-4 border rounded-md w-48 h-32 overflow-auto",
                    targetsStatus && targetsStatus[index] ? "bg-green-100 border-green-400" : "bg-red-100 border-red-400"
                )}>
                    <h3 className="font-semibold mb-2">Target {index + 1}</h3>
                    <p className="text-sm">{target}</p>
                </div>
            ))}
        </div>
    </div>
}