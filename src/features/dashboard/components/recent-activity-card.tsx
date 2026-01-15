import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CheckCircle2Icon, ClockIcon} from "lucide-react";

export default function RecentActivityCard() {

    // TODO Dummy data
    const recentActivity = [
        { action: "15 words learned", category: "Vacation", time: "2 hours ago" },
        { action: "Chat-scenario completed", category: "Restaurant", time: "Yesterday" },
        { action: "Grammar rule learned", category: "Future 1", time: "3 days ago" },
    ]

    return <Card>
        <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent learning successes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            { recentActivity.map((activity, index) => (
                <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
                >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle2Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-tight">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.category}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <ClockIcon className="h-3 w-3" />
                            {activity.time}
                        </div>
                    </div>
                </div>
            ))}
        </CardContent>
    </Card>
}