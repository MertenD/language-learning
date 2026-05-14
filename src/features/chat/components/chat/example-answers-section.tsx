"use client"

import {MessageSection} from "@/features/chat/components/chat/message-section"
import {ExampleAnswerChip} from "@/features/chat/components/chat/example-answer-chip"

interface ExampleAnswersSectionProps {
    content: string
    onExampleClick?: (text: string) => void
}

export function ExampleAnswersSection({content, onExampleClick}: ExampleAnswersSectionProps) {
    const lines = content.split("\n").filter(line => line.trim())
    const items = lines.filter(line => /^\d+\./.test(line.trim()))

    if (items.length === 0) {
        return <MessageSection markdownContent={content} variant="examples" isCollapsible />
    }

    const cleanItems = items.map(item => item.replace(/^\d+\.\s*/, "").trim())

    return (
        <MessageSection variant="examples" isCollapsible>
            <div className="flex flex-wrap gap-2">
                {cleanItems.map((item, index) => (
                    <ExampleAnswerChip
                        key={index}
                        text={item}
                        onClick={text => onExampleClick?.(text)}
                    />
                ))}
            </div>
        </MessageSection>
    )
}
