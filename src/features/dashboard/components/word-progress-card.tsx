import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {BookOpenIcon} from "lucide-react";
import WordsLevelCountCard from "@/features/dashboard/components/words-level-count-card";
import DailyGoal from "@/features/dashboard/components/daily-goal-card";

type WordProgressProps = {
    className?: string
}

export default function WordProgressCard({ className }: WordProgressProps) {

    // TODO Just dummy data
    const wordsLevelStats = [
        { level: 5, count: 30 },
        { level: 4, count: 60 },
        { level: 3, count: 90 },
        { level: 2, count: 120 },
        { level: 1, count: 150 },
    ] as {
        level: 1 | 2 | 3 | 4 | 5
        count: number
    }[]

    return <Card className={className}>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-2xl">Vocabulary Progress</CardTitle>
                    <CardDescription>Your learning statistics overview</CardDescription>
                </div>
                <Link href="/words" prefetch>
                    <Button variant="outline" size="sm">
                        <BookOpenIcon className="mr-2 h-4 2-4" />
                        View Vocabulary
                    </Button>
                </Link>
            </div>
        </CardHeader>
        <CardContent className="space-y-6 h-full flex flex-col justify-between">
            <div className="grid gap-4 sm:grid-cols-5">
                { wordsLevelStats.map(({ level, count }) => (
                    <WordsLevelCountCard level={level} count={count} key={level} />
                ))}
            </div>

            <DailyGoal
                title="Daily Goal: Learn 20 words"
                description="15 words are left to reach your daily goal."
                href="/practice"
            />
        </CardContent>
    </Card>
}