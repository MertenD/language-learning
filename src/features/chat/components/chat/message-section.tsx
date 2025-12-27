"use client"

import {AlertCircle, BookOpen, ChevronDownIcon, ChevronRightIcon, Lightbulb} from "lucide-react"
import React, {useState} from "react";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {MarkdownContent} from "@/components/markdown-content";
import {cn} from "@/lib/utils";

type SectionVariant = "default" | "explanation" | "mistakes" | "examples"

type MessageSectionProps = {
    variant?: SectionVariant
    isCollapsible?: boolean
    className?: string
} & (
    | { markdownContent: string; children?: never }
    | { markdownContent?: never; children: React.ReactNode }
)

export function MessageSection({ variant = "default", isCollapsible, className, markdownContent, children }: MessageSectionProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const styles = {
        default: "bg-card border border-border shadow-sm",
        explanation: "bg-chart-2/10 border border-chart-2/30 shadow-sm",
        mistakes: "bg-destructive/10 border border-destructive/30 shadow-sm",
        examples: "bg-chart-1/10 border border-chart-1/30 shadow-sm",
    }

    const iconStyles = {
        default: "",
        explanation: "text-chart-2",
        mistakes: "text-destructive",
        examples: "text-chart-1",
    }

    const icons = {
        default: null,
        explanation: <BookOpen className={`h-4 w-4 ${iconStyles.explanation}`} />,
        mistakes: <AlertCircle className={`h-4 w-4 ${iconStyles.mistakes}`} />,
        examples: <Lightbulb className={`h-4 w-4 ${iconStyles.examples}`} />,
    }

    const titles = {
        default: null,
        explanation: "Erklärung",
        mistakes: "Korrektur",
        examples: "Beispielantworten",
    }

    return <Collapsible
        className={cn("flex max-w-[85%] flex-col gap-1 items-start", className)}
        open={isCollapsible === undefined || !isCollapsible || isOpen}
        onOpenChange={setIsOpen}
    >
        <div className={`rounded-xl px-5 py-4 w-full ${styles[variant]}`}>
            {icons[variant] && isCollapsible ? (
                <CollapsibleTrigger className="w-full flex items-center justify-between gap-2 mb-3 pb-2 border-b border-current/10">
                    <div className="flex flex-row items-center gap-2">
                        {icons[variant]}
                        <span className="text-xs font-semibold uppercase tracking-wide opacity-80">{titles[variant]}</span>
                    </div>
                    {isOpen ? (
                        <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                </CollapsibleTrigger>
            ) : icons[variant] && (
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-current/10">
                    {icons[variant]}
                    <span className="text-xs font-semibold uppercase tracking-wide opacity-80">{titles[variant]}</span>
                </div>
            )}
            <CollapsibleContent className="text-sm leading-relaxed text-card-foreground">
                { markdownContent ? <MarkdownContent content={markdownContent} /> : children }
            </CollapsibleContent>
        </div>
    </Collapsible>
}
