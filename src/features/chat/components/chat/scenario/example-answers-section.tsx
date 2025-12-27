"use client"

import { Lightbulb } from "lucide-react"
import {MessageSection} from "@/features/chat/components/chat/message-section";
import {ExampleAnswerChip} from "@/features/chat/components/chat/scenario/example-answer-chip";

interface ExampleAnswersSectionProps {
    content: string
    onExampleClick?: (text: string) => void
}

export function ExampleAnswersSection({ content, onExampleClick }: ExampleAnswersSectionProps) {
    // TODO improve parsing of example answers (e.g. json array like in the target status)
    const lines = content.split("\n").filter((line) => line.trim())
    const items = lines.filter((line) => /^\d+\./.test(line.trim()))

    if (items.length === 0) {
        return <MessageSection content={content} variant="examples" />
    }

    const cleanItems = items.map((item) => item.replace(/^\d+\.\s*/, "").trim())

    return (
        <div className="flex max-w-[85%] flex-col gap-1 items-start">
            <div className="rounded-xl px-5 py-4 w-full bg-chart-1/10 border border-chart-1/30 shadow-sm">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-chart-1/20">
                    <Lightbulb className="h-4 w-4 text-chart-1" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-chart-1">Beispielantworten</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {cleanItems.map((item, index) => (
                        <ExampleAnswerChip
                            key={index}
                            text={item}
                            onClick={(text) => {
                                console.log("Selected example:", text)
                                onExampleClick?.(text)
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
