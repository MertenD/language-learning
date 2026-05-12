"use client"

import UserStatCard from "@/features/dashboard/components/user-stat-card";
import {BookOpenIcon, FlameIcon, TrophyIcon, ZapIcon} from "lucide-react";
import {useLanguageStats} from "@/features/user/hooks/use-stats";

export default function UserStats() {

    const { data: stats, isLoading } = useLanguageStats()

    return <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <UserStatCard
            title="Streak"
            isLoading={isLoading}
            value={stats?.streakDays}
            icon={<FlameIcon />}
            chartColorNumber={1}
        />

        <UserStatCard
            title="XP Points"
            isLoading={isLoading}
            value={stats?.xp}
            icon={<ZapIcon />}
            chartColorNumber={2}
        />

        <UserStatCard
            title="Level"
            isLoading={isLoading}
            value={stats?.level}
            icon={<TrophyIcon />}
            chartColorNumber={3}
        />

        <UserStatCard
            title="Vocabulary"
            isLoading={isLoading}
            value={stats?.wordCount}
            icon={<BookOpenIcon />}
            chartColorNumber={4}
        />
    </section>
}