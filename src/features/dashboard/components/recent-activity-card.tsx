"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ActivityIcon,
    BookOpenIcon,
    ClockIcon,
    MessageSquareIcon,
    StarIcon,
    TrophyIcon
} from "lucide-react";
import { ActivityType } from "@/generated/prisma/enums";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useRecentActivities } from "@/features/user/hooks/use-recent-activities";
import React from "react";

const getActivityIcon = (type: ActivityType) => {
    switch (type) {
        case ActivityType.VOCABULARY_ADDED:
        case ActivityType.NEW_VOCABULARY_LEARNED:
            return <BookOpenIcon className="h-4 w-4 text-blue-500" />;
        case ActivityType.SCENARIO_STARTED:
        case ActivityType.CHAT_INITIATED:
            return <MessageSquareIcon className="h-4 w-4 text-green-500" />;
        case ActivityType.LEVEL_UP:
        case ActivityType.VOCABULARY_MASTERED:
            return <TrophyIcon className="h-4 w-4 text-yellow-500" />;
        case ActivityType.LANGUAGE_STARTED:
            return <StarIcon className="h-4 w-4 text-purple-500" />;
        default:
            return <ActivityIcon className="h-4 w-4 text-gray-500" />;
    }
};

const getActivityTitle = (type: ActivityType) => {
    switch (type) {
        case ActivityType.VOCABULARY_ADDED:
            return "Wortschatz erweitert";
        case ActivityType.NEW_VOCABULARY_LEARNED:
            return "Neue Vokabeln gelernt";
        case ActivityType.SCENARIO_STARTED:
            return "Szenario begonnen";
        case ActivityType.CHAT_INITIATED:
            return "Chat gestartet";
        case ActivityType.LEVEL_UP:
            return "Level aufgestiegen";
        case ActivityType.VOCABULARY_MASTERED:
            return "Vokabel gemeistert";
        case ActivityType.LANGUAGE_STARTED:
            return "Sprache begonnen";
        default:
            return "Aktivität";
    }
};

export default function RecentActivityCard() {
    const { data: activities, isLoading } = useRecentActivities();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Kürzliche Aktivitäten</CardTitle>
                <CardDescription>Deine letzten Lernerfolge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="flex flex-col gap-3">
                        <div className="h-16 w-full animate-pulse rounded-lg bg-secondary/50" />
                        <div className="h-16 w-full animate-pulse rounded-lg bg-secondary/50" />
                        <div className="h-16 w-full animate-pulse rounded-lg bg-secondary/50" />
                    </div>
                ) : activities && activities.length > 0 ? (
                    activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
                        >
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-tight">
                                    {getActivityTitle(activity.type)}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <ClockIcon className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: de })}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">Keine kürzlichen Aktivitäten.</p>
                )}
            </CardContent>
        </Card>
    );
}
