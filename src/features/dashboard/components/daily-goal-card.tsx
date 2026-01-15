import {TargetIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import Link from "next/link";

type DailyGoalProps = {
    title: string
    description: string
    href: string
}

export default function DailyGoal({ title, description, href }: DailyGoalProps) {

    return <div className="flex items-center justify-between rounded-lg bg-primary/5 p-4">
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <TargetIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
        <Link href={href} prefetch>
            <Button>Start now</Button>
        </Link>
    </div>
}