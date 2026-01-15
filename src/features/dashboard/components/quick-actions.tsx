import Link from "next/link";
import {Button} from "@/components/ui/button";
import {BookOpenIcon, BotMessageSquareIcon, LucideProps, TargetIcon} from "lucide-react";
import {ForwardRefExoticComponent, RefAttributes} from "react";

export default function QuickActions() {

    return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard
            icon={BookOpenIcon}
            title="Add vocabulary"
            description="Expand your vocabulary"
            href="/words"
        />

        <QuickActionCard
            icon={BotMessageSquareIcon}
            title="Start a chat"
            description="Ask the AI anything"
            href="/chat/new"
        />

        <QuickActionCard
            icon={TargetIcon}
            title="Play minigames"
            description="Learn vocabulary"
            href="/practice"
        />
    </div>
}

function QuickActionCard({ icon, title, description, href }: {
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
    title: string
    description: string
    href: string
}) {
    const Icon = icon

    return <Link href={href}>
        <Button
            variant="outline"
            className="h-auto w-full flex-col gap-3 p-6 hover:bg-accent transition-colors bg-transparent"
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-6 w-6" />
            </div>
            <div className="space-y-1 text-center">
                <p className="font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </Button>
    </Link>
}