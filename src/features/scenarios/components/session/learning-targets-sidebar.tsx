import {Target} from "lucide-react"
import {LearningTargetCard} from "@/features/scenarios/components/session/learning-target-card"

interface LearningTargetsSidebarProps {
    targets: string[]
    targetsStatus: boolean[]
}

export function LearningTargetsSidebar({targets, targetsStatus}: LearningTargetsSidebarProps) {
    return (
        <div className="flex flex-col gap-4 p-6 w-full h-full bg-background/80 backdrop-blur-sm border-l border-border overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">Lernziele</h2>
            </div>
            {targets.map((target, index) => (
                <LearningTargetCard
                    key={index}
                    target={target}
                    index={index}
                    isCompleted={targetsStatus && targetsStatus[index]}
                />
            ))}
        </div>
    )
}
