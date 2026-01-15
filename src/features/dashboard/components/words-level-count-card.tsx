type WordsLevelCountCardProps = {
    level: 1 | 2 | 3 | 4 | 5
    count: number
}

export default function WordsLevelCountCard({ level, count }: WordsLevelCountCardProps) {

    let color = ""
    switch (level) {
        case 1:
            color = "bg-chart-1"
            break
        case 2:
            color = "bg-chart-2"
            break
        case 3:
            color = "bg-chart-3"
            break
        case 4:
            color = "bg-chart-4"
            break
        case 5:
            color = "bg-chart-5"
            break
        default:
            color = "bg-muted"
    }

    return <div key={level} className="space-y-2 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${color}`}/>
            <p className="text-sm font-medium text-muted-foreground">Level {level}</p>
        </div>
        <p className="text-2xl font-bold">{count}</p>
    </div>
}