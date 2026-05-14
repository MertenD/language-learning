"use client"

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import ProfileTab from "@/features/settings/components/profile-tab";
import LanguagesTab from "@/features/settings/components/languages-tab";
import SubscriptionTab from "@/features/settings/components/subscription-tab";
import AccountTab from "@/features/settings/components/account-tab";

export default function SettingsPage() {
    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
            </div>
            <Tabs defaultValue="profile">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="languages">Languages</TabsTrigger>
                    <TabsTrigger value="subscription">Subscription</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>
                <TabsContent value="profile"><ProfileTab /></TabsContent>
                <TabsContent value="languages"><LanguagesTab /></TabsContent>
                <TabsContent value="subscription"><SubscriptionTab /></TabsContent>
                <TabsContent value="account"><AccountTab /></TabsContent>
            </Tabs>
        </div>
    )
}
