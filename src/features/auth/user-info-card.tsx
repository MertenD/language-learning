"use client"

import {Button} from "@/components/ui/button";
import {CreditCardIcon, LogOutIcon, StarIcon} from "lucide-react";
import {authClient} from "@/lib/auth-client";
import {useRouter} from "next/navigation";
import {useHasActiveSubscription} from "@/features/subscriptions/hooks/use-subscription";
import {useLanguageStats} from "@/features/user/hooks/use-stats";
import {useTranslations} from "next-intl";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

type UserInfoCardProps = {
    username: string
}

export default function UserInfoCard({ username }: UserInfoCardProps) {
    const router = useRouter()
    const { hasActiveSubscription, isLoading } = useHasActiveSubscription()
    const { data: stats, isLoading: isStatsLoading } = useLanguageStats()
    const { data: session } = authClient.useSession()
    const t = useTranslations('auth.userInfo');

    const displayName = session?.user.name?.split("@")[0] ?? username
    const avatarImage = session?.user.image ?? undefined

    return <div className="rounded-lg border bg-linear-to-br from-chart-1/10 to-chart-2/10 p-4">
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarImage} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                        {displayName[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="text-sm font-semibold">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{
                        !stats || isStatsLoading ? (
                            <span className="inline-block h-3 w-6 animate-pulse rounded-xl bg-chart-1/10" />
                        ) : t('level', { level: stats.level })
                    }</p>
                </div>
            </div>

            <div className="space-y-1">
                {!hasActiveSubscription && !isLoading && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 h-8 px-2 text-xs font-medium"
                        onClick={() => authClient.checkout({ slug: "pro" })}
                    >
                        <StarIcon className="h-4 w-4" />
                        {t('upgradeLabel')}
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 h-8 px-2 text-xs font-medium"
                    onClick={() => authClient.customer.portal()}
                >
                    <CreditCardIcon className="h-4 w-4" />
                    {t('billingLabel')}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 h-8 px-2 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => authClient.signOut({
                        fetchOptions: {
                            onSuccess: () => {
                                router.push("/login")
                            }
                        }
                    })}
                >
                    <LogOutIcon className="h-4 w-4" />
                    {t('logoutLabel')}
                </Button>
            </div>
        </div>
    </div>
}
