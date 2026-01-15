import {SidebarTrigger} from "@/components/ui/sidebar";
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator} from "@/components/ui/breadcrumb";
import React from "react";

interface AppHeaderProps {
    breadcrumbs?: {
        title: string;
        url: string;
    }[]
}

export default function AppHeader({ breadcrumbs }: AppHeaderProps) {

    return <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-card">
        <SidebarTrigger />
        {breadcrumbs && (
            <>
                <div className="h-4 w-[1px] bg-border mx-2" />
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={crumb.url}>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={crumb.url} className="text-lg font-semibold">
                                        {crumb.title}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                            </React.Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </>
        )}
    </header>
}