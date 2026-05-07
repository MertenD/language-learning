"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {BookOpenIcon} from "lucide-react";
import WordsLevelCountCard from "@/features/dashboard/components/words-level-count-card";
import DailyGoal from "@/features/dashboard/components/daily-goal-card";
import {useWordProgressStats} from "@/features/user/hooks/use-stats";
import {useState, useEffect} from "react";

const DAILY_GOAL_KEY = "daily-goal-target"
const DEFAULT_DAILY_GOAL = 20

type WordProgressProps = {
    className?: string
}

export default function WordProgressCard({ className }: WordProgressProps) {
    const { data: stats, isLoading } = useWordProgressStats()
    const [dailyGoalTarget, setDailyGoalTarget] = useState(DEFAULT_DAILY_GOAL)

    useEffect(() => {
        const stored = localStorage.getItem(DAILY_GOAL_KEY)
        if (stored) {
            const parsed = parseInt(stored, 10)
            if (!isNaN(parsed) && parsed > 0) setDailyGoalTarget(parsed)
        }
    }, [])

    const handleTargetChange = (value: number) => {
        setDailyGoalTarget(value)
        localStorage.setItem(DAILY_GOAL_KEY, String(value))
    }

    const levelStats = stats
        ? [
            { level: 0 as const, count: stats.new },
            { level: 1 as const, count: stats.level1 },
            { level: 2 as const, count: stats.level2 },
            { level: 3 as const, count: stats.level3 },
            { level: 4 as const, count: stats.level4 },
            { level: 5 as const, count: stats.level5 },
        ]
        : []

    const dailyGoalTitle = stats?.dueCount
        ? `${stats.dueCount} word${stats.dueCount !== 1 ? "s" : ""} due for review`
        : "No words due today"

    const dailyGoalDescription = stats?.reviewedTodayCount
        ? `You've already reviewed ${stats.reviewedTodayCount} word${stats.reviewedTodayCount !== 1 ? "s" : ""} today. Keep it up!`
        : stats?.dueCount
            ? "Start a practice session to review your vocabulary."
            : "Great job — you're all caught up!"

    return <Card className={className}>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-2xl">Vocabulary Progress</CardTitle>
                    <CardDescription>Your learning statistics overview</CardDescription>
                </div>
                <Link href="/words" prefetch>
                    <Button variant="outline" size="sm">
                        <BookOpenIcon className="mr-2 h-4 w-4" />
                        View Vocabulary
                    </Button>
                </Link>
            </div>
        </CardHeader>
        <CardContent className="space-y-6 h-full flex flex-col justify-between">
            <div className="grid gap-4 grid-cols-3 sm:grid-cols-6">
                {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-20 rounded-lg border bg-card animate-pulse" />
                    ))
                    : levelStats.map(({ level, count }) => (
                        <WordsLevelCountCard level={level} count={count} key={level} />
                    ))
                }
            </div>

            <DailyGoal
                title={dailyGoalTitle}
                description={dailyGoalDescription}
                href="/practice"
                current={stats?.reviewedTodayCount}
                target={dailyGoalTarget}
                onTargetChange={handleTargetChange}
            />
        </CardContent>
    </Card>
}
