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
    return (
        <header className="flex h-14 items-center gap-2 border-b px-4 bg-card">
            <SidebarTrigger />

            {breadcrumbs && (
                <>
                    <div className="h-4 w-[1px] bg-border mx-2 shrink-0" />

                    <div className="flex-1 min-w-0">
                        <Breadcrumb>
                            <BreadcrumbList className="flex min-w-0 flex-nowrap items-center whitespace-nowrap overflow-hidden">
                                {breadcrumbs.map((crumb, index) => {
                                    const isLast = index === breadcrumbs.length - 1

                                    return (
                                        <React.Fragment key={crumb.url}>
                                            <BreadcrumbItem className={isLast ? "min-w-0" : "shrink-0"}>
                                                <BreadcrumbLink
                                                    href={crumb.url}
                                                    className={[
                                                        "text-lg font-semibold",
                                                        isLast
                                                            ? "block min-w-0 max-w-full truncate"
                                                            : "whitespace-nowrap shrink-0",
                                                    ].join(" ")}
                                                >
                                                    {crumb.title}
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>

                                            {index < breadcrumbs.length - 1 && (
                                                <BreadcrumbSeparator className="shrink-0" />
                                            )}
                                        </React.Fragment>
                                    )
                                })}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </>
            )}
        </header>
    )
}
