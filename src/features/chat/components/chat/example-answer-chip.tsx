"use client"

import {Badge} from "@/components/ui/badge"

interface ExampleAnswerChipProps {
    text: string
    onClick?: (text: string) => void
}

export function ExampleAnswerChip({text, onClick}: ExampleAnswerChipProps) {
    return (
        <Badge
            variant="outline"
            className="px-4 py-2 rounded-lg bg-card border-chart-1/50 hover:border-chart-1 hover:bg-chart-1/10 hover:shadow-md transition-all duration-200 text-sm font-medium cursor-pointer hover:scale-103"
            onClick={() => onClick?.(text)}
        >
            <p className="text-wrap">
                {text}
            </p>
        </Badge>
    )
}
