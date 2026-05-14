import {CheckCircle2, Circle} from "lucide-react"
import {Card, CardContent} from "@/components/ui/card"
import {cn} from "@/lib/utils"

interface LearningTargetCardProps {
    target: string
    index: number
    isCompleted: boolean
}

export function LearningTargetCard({target, index, isCompleted}: LearningTargetCardProps) {
    return (
        <Card
            className={cn(
                "relative transition-all duration-300 shadow-sm hover:shadow-md border-2",
                isCompleted ? "bg-emerald-500/20 border-emerald-500" : "bg-muted/30 border-border",
            )}
        >
            <CardContent className="p-5">
                <div className="flex items-start gap-3">
                    {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                        <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-2 text-foreground">Ziel {index + 1}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{target}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
