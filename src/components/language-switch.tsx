"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { ChevronDown, Check, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import {useLanguage} from "@/features/user/hooks/use-language";
import {ManageLanguagesDialog} from "@/components/manage-languages-dialog";
import {useState} from "react";

export function LanguageSwitcher() {
    const { currentLanguage, availableLanguages, setCurrentLanguage, isLoading } = useLanguage()
    const [manageDialogOpen, setManageDialogOpen] = useState(false)

    if (isLoading) {
        return <div className="h-10 w-full animate-pulse bg-muted rounded-lg" />
    }

    if (!currentLanguage) return null

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                    <span className="text-xl">{currentLanguage.flagEmoji}</span>
                    <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{currentLanguage.name}</p>
                        <p className="text-xs text-muted-foreground">Level -1</p>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                    {availableLanguages.map((language) => {
                        const isActive = currentLanguage === language

                        return (
                            <DropdownMenuItem
                                key={language.id}
                                onClick={() => setCurrentLanguage(language)}
                                className={cn("flex items-center gap-3 cursor-pointer", isActive && "bg-accent")}
                            >
                                <span className="text-xl">{language.flagEmoji}</span>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{language.name}</p>
                                    <p className="text-xs text-muted-foreground">Level -1</p>
                                </div>
                                {isActive && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                        )
                    })}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setManageDialogOpen(true)}
                    >
                        <Settings className="h-4 w-4" />
                        <span>Manage Languages</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ManageLanguagesDialog
                open={manageDialogOpen}
                onOpenChange={setManageDialogOpen}
            />
        </>
    )
}
