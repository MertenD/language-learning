"use client"

import {BookOpenIcon, BotMessageSquareIcon, BrainIcon, HomeIcon, TargetIcon} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import UserInfoCard from "@/features/auth/user-info-card";
import {LanguageSwitcher} from "@/components/language-switch";
import {useTranslations} from "next-intl";

type AppSidebarProps = {
    username: string
}

export default function AppSidebar({ username }: AppSidebarProps) {
    const pathName = usePathname()
    const t = useTranslations('sidebar');

    const menuItems = [
        {
            title: t('groupTitle'),
            items: [
                { title: t('nav.dashboard'), icon: HomeIcon, url: "/dashboard" },
                { title: t('nav.vocabulary'), icon: BookOpenIcon, url: "/words" },
                { title: t('nav.grammar'), icon: BrainIcon, url: "/grammar" },
                { title: t('nav.practice'), icon: TargetIcon, url: "/practice" },
                { title: t('nav.chat'), icon: BotMessageSquareIcon, url: "/chat" },
            ]
        }
    ]

    return <Sidebar>
        <SidebarHeader className="bg-card">
            <SidebarMenuItem>
                <SidebarMenuButton asChild className="gap-x-4 h-10 px-4">
                    <Link href="/" prefetch>
                        <Image src="/logos/logo.svg" alt="App Icon" width={20} height={20} />
                        <span className="font-semibold text-sm">EasyLingu</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>

            <LanguageSwitcher />
        </SidebarHeader>
        <SidebarContent className="bg-card p-1">
            { menuItems.map(group =>
                <SidebarGroup key={group.title}>
                    <SidebarGroupContent>
                        <nav className="flex-1 space-y-2">
                            {group.items.map((item) => {
                                const isActive = item.url === "/"
                                    ? pathName === "/"
                                    : pathName.startsWith(item.url)
                                const Icon = item.icon

                                return (
                                    <Link
                                        prefetch
                                        key={item.url}
                                        href={item.url}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-accent hover:text-foreground",
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.title}
                                    </Link>
                                )
                            })}
                        </nav>
                    </SidebarGroupContent>
                </SidebarGroup>
            )}
        </SidebarContent>
        <SidebarFooter className="bg-card p-4">
            <UserInfoCard username={username} />
        </SidebarFooter>
    </Sidebar>
}
