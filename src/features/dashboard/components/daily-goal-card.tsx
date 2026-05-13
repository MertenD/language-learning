"use client"

import { useState } from "react"
import {TargetIcon, PencilIcon, CheckIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Input} from "@/components/ui/input";
import {Progress} from "@/components/ui/progress";
import {useTranslations} from "next-intl";

type DailyGoalProps = {
    title: string
    description: string
    href: string
    current?: number
    target?: number
    onTargetChange?: (value: number) => void
}

export default function DailyGoal({ title, description, href, current, target, onTargetChange }: DailyGoalProps) {
    const [isEditingTarget, setIsEditingTarget] = useState(false)
    const [editValue, setEditValue] = useState(String(target ?? 20))
    const t = useTranslations('dashboard.dailyGoal');

    const hasProgress = current !== undefined && target !== undefined
    const progress = hasProgress ? Math.min(Math.round((current / target) * 100), 100) : 0

    const handleSaveTarget = () => {
        const parsed = parseInt(editValue, 10)
        if (!isNaN(parsed) && parsed > 0 && onTargetChange) {
            onTargetChange(parsed)
        }
        setIsEditingTarget(false)
    }

    return <div className="flex flex-col gap-3 rounded-lg bg-primary/5 p-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary flex-shrink-0">
                    <TargetIcon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
            <Link href={href} prefetch>
                <Button>{t('startNow')}</Button>
            </Link>
        </div>

        {hasProgress && (
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t('wordsReviewedToday', { current, target })}</span>
                    {isEditingTarget ? (
                        <div className="flex items-center gap-1">
                            <Input
                                className="h-6 w-16 text-xs px-2"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") handleSaveTarget(); if (e.key === "Escape") setIsEditingTarget(false) }}
                                autoFocus
                            />
                            <button onClick={handleSaveTarget} className="text-primary hover:text-primary/80">
                                <CheckIcon className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => { setEditValue(String(target)); setIsEditingTarget(true) }}
                            className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                            <PencilIcon className="h-3 w-3" />
                            {t('goal', { target })}
                        </button>
                    )}
                </div>
                <Progress value={progress} className="h-2" />
            </div>
        )}
    </div>
}
