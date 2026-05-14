"use client"

import {useHasActiveSubscription} from "@/features/subscriptions/hooks/use-subscription";
import {authClient} from "@/lib/auth-client";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {CreditCardIcon, StarIcon} from "lucide-react";

export default function SubscriptionTab() {
    const { hasActiveSubscription, subscription, isLoading } = useHasActiveSubscription()

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Manage your plan and billing.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                ) : hasActiveSubscription ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge>Pro</Badge>
                            <span className="text-sm text-muted-foreground">Active</span>
                        </div>
                        {subscription?.currentPeriodEnd && (
                            <p className="text-sm text-muted-foreground">
                                Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">Free Plan</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Upgrade to Pro to unlock all features.</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="gap-2">
                {hasActiveSubscription ? (
                    <Button variant="outline" onClick={() => authClient.customer.portal()}>
                        <CreditCardIcon className="mr-2 h-4 w-4" />
                        Manage Billing
                    </Button>
                ) : (
                    <Button onClick={() => authClient.checkout({ slug: "pro" })}>
                        <StarIcon className="mr-2 h-4 w-4" />
                        Upgrade to Pro
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
