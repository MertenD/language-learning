"use client"

import {Button} from "@/components/ui/button";
import {CreditCardIcon, LogOutIcon, StarIcon} from "lucide-react";
import {authClient} from "@/lib/auth-client";
import {useRouter} from "next/navigation";
import {useHasActiveSubscription} from "@/features/subscriptions/hooks/use-subscription";

type UserInfoCardProps = {
    username: string
}

export default function UserInfoCard({ username }: UserInfoCardProps) {
    const router = useRouter()
    const { hasActiveSubscription, isLoading } = useHasActiveSubscription()

    return <div className="rounded-lg border bg-linear-to-br from-chart-1/10 to-chart-2/10 p-4">
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <span className="text-sm font-bold text-primary-foreground">U</span>
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold">{username}</p>
                    <p className="text-xs text-muted-foreground">Level 8</p>
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
                        Upgrade to Pro
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 h-8 px-2 text-xs font-medium"
                    onClick={() => authClient.customer.portal()}
                >
                    <CreditCardIcon className="h-4 w-4" />
                    Billing Portal
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
                    Logout
                </Button>
            </div>
        </div>
    </div>
}