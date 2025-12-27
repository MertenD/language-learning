import { BookOpen, AlertCircle, Lightbulb } from "lucide-react"
import { MarkdownContent } from "@/components/markdown-content"

type SectionVariant = "default" | "explanation" | "mistakes" | "examples"

interface MessageSectionProps {
    content: string
    variant?: SectionVariant
}

export function MessageSection({ content, variant = "default" }: MessageSectionProps) {
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

    return (
        <div className="flex max-w-[85%] flex-col gap-1 items-start">
            <div className={`rounded-xl px-5 py-4 w-full ${styles[variant]}`}>
                {icons[variant] && (
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-current/10">
                        {icons[variant]}
                        <span className="text-xs font-semibold uppercase tracking-wide opacity-80">{titles[variant]}</span>
                    </div>
                )}
                <div className="text-sm leading-relaxed text-card-foreground">
                    <MarkdownContent content={content} />
                </div>
            </div>
        </div>
    )
}
