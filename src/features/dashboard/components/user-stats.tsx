"use client"

import UserStatCard from "@/features/dashboard/components/user-stat-card";
import {BookOpenIcon, FlameIcon, TrophyIcon, ZapIcon} from "lucide-react";
import {useLanguageStats} from "@/features/user/hooks/use-stats";
import {useTranslations} from "next-intl";

export default function UserStats() {
    const { data: stats, isLoading } = useLanguageStats()
    const t = useTranslations('dashboard.stats');

    return <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <UserStatCard
            title={t('streak')}
            isLoading={isLoading}
            value={stats?.streakDays}
            icon={<FlameIcon />}
            chartColorNumber={1}
        />

        <UserStatCard
            title={t('xp')}
            isLoading={isLoading}
            value={stats?.xp}
            icon={<ZapIcon />}
            chartColorNumber={2}
        />

        <UserStatCard
            title={t('level')}
            isLoading={isLoading}
            value={stats?.level}
            icon={<TrophyIcon />}
            chartColorNumber={3}
        />

        <UserStatCard
            title={t('vocabulary')}
            isLoading={isLoading}
            value={stats?.wordCount}
            icon={<BookOpenIcon />}
            chartColorNumber={4}
        />
    </section>
}
