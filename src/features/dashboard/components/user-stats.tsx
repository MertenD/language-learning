"use client"

import UserStatCard from "@/features/dashboard/components/user-stat-card";
import {BookOpenIcon, FlameIcon, TrophyIcon, ZapIcon} from "lucide-react";
import {useSuspenseLanguageStats} from "@/features/user/hooks/use-stats";

export default function UserStats() {

    const { data: stats, isFetching } = useSuspenseLanguageStats()

    return <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <UserStatCard
            title="Streak"
            isLoading={!stats || isFetching}
            value={stats?.streakDays}
            icon={<FlameIcon />}
            chartColorNumber={1}
        />

        <UserStatCard
            title="XP Points"
            isLoading={!stats || isFetching}
            value={stats?.xp}
            icon={<ZapIcon />}
            chartColorNumber={2}
        />

        <UserStatCard
            title="Level"
            isLoading={!stats || isFetching}
            value={stats?.level}
            icon={<TrophyIcon />}
            chartColorNumber={3}
        />

        <UserStatCard
            title="Vocabulary"
            isLoading={!stats || isFetching}
            value={stats?.wordCount}
            icon={<BookOpenIcon />}
            chartColorNumber={4}
        />
    </section>
}