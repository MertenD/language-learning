type WordsLevelCountCardProps = {
    level: 0 | 1 | 2 | 3 | 4 | 5
    count: number
}

const LEVEL_COLORS: Record<number, string> = {
    0: "bg-muted-foreground/40",
    1: "bg-chart-1",
    2: "bg-chart-2",
    3: "bg-chart-3",
    4: "bg-chart-4",
    5: "bg-chart-5",
}

const LEVEL_LABELS: Record<number, string> = {
    0: "New",
    1: "Level 1",
    2: "Level 2",
    3: "Level 3",
    4: "Level 4",
    5: "Level 5",
}

export default function WordsLevelCountCard({ level, count }: WordsLevelCountCardProps) {
    const color = LEVEL_COLORS[level] ?? "bg-muted"
    const label = LEVEL_LABELS[level] ?? `Level ${level}`

    return <div className="space-y-2 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${color}`}/>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
        </div>
        <p className="text-2xl font-bold">{count}</p>
    </div>
}