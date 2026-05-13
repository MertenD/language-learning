import WordProgressCard from "@/features/dashboard/components/word-progress-card";
import RecentActivityCard from "@/features/dashboard/components/recent-activity-card";
import ScenarioSuggestionCard from "@/features/dashboard/components/scenario-suggestion-card";
import QuickActions from "@/features/dashboard/components/quick-actions";
import UserStats from "@/features/dashboard/components/user-stats";
import {getTranslations} from "next-intl/server";

export default async function AppDashboard() {
    const t = await getTranslations('dashboard');

    return <div className="h-full max-w-7xl mx-auto p-4 md:px-10 md:py-6 space-y-8">
        <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-bold">{t('welcome')}</h1>
            <p className="text-base md:text-lg text-muted-foreground text-pretty">{t('subtitle')}</p>
        </div>

        <UserStats />

        <section className="grid gap-6 lg:grid-cols-3">
            <WordProgressCard className="lg:col-span-2" />
            <RecentActivityCard />
        </section>

        <section>
            <ScenarioSuggestionCard />
        </section>

        <section>
            <QuickActions />
        </section>
    </div>
}
