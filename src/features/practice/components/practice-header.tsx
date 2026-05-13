"use client"

import {useTranslations} from "next-intl";

export default function PracticeHeader() {
    const t = useTranslations('practice.header');

    return <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
    </div>
}
