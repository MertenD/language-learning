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

export const menuItems = [
    {
        title: "Language Learning",
        items: [
            {
                title: "Dashboard",
                icon: HomeIcon,
                url: "/dashboard"
            },
            {
                title: "Vocabulary",
                icon: BookOpenIcon,
                url: "/words"
            },
            {
                title: "Grammar",
                icon: BrainIcon,
                url: "/grammar"
            },
            {
                title: "Practice",
                icon: TargetIcon,
                url: "/practice"
            },
            {
                title: "Chat",
                icon: BotMessageSquareIcon,
                url: "/chat"
            }
        ]
    }
]

type AppSidebarProps = {
    username: string
}

export default function AppSidebar({ username }: AppSidebarProps) {
    const pathName = usePathname()

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