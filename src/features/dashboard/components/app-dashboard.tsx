import UserStatCard from "@/features/dashboard/components/user-stat-card";
import {BookOpenIcon, FlameIcon, TrophyIcon, ZapIcon} from "lucide-react";
import WordProgressCard from "@/features/dashboard/components/word-progress-card";
import RecentActivityCard from "@/features/dashboard/components/recent-activity-card";
import ScenarioSuggestionCard from "@/features/dashboard/components/scenario-suggestion-card";
import QuickActions from "@/features/dashboard/components/quick-actions";

export default function AppDashboard() {

    return <div className="h-full max-w-7xl mx-auto p-4 md:px-10 md:py-6 space-y-8">
        <div className="space-y-2">
            <h1 className="text-4xl font-bold">Willkommen zurück!</h1>
            <p className="text-lg text-muted-foreground text-pretty">Du macht großartige Fortschritte. Weiter so!</p>
        </div>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <UserStatCard
                title="Streak"
                value="15 Tage"
                icon={<FlameIcon />}
                chartColorNumber={1}
            />

            <UserStatCard
                title="XP Points"
                value="3240"
                icon={<ZapIcon />}
                chartColorNumber={2}
            />

            <UserStatCard
                title="Level"
                value="3"
                icon={<TrophyIcon />}
                chartColorNumber={3}
            />

            <UserStatCard
                title="Vocabulary"
                value="284"
                icon={<BookOpenIcon />}
                chartColorNumber={4}
            />
        </section>

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