"use server"

import { cookies } from 'next/headers';
import prisma from '@/lib/db';

const SUPPORTED = ['en', 'de'];

export async function setLocaleAction(nativeLanguageId: string): Promise<{ locale: string; wasSet: boolean }> {
    const cookieStore = await cookies();
    const existing = cookieStore.get('ui-locale')?.value;
    if (existing && SUPPORTED.includes(existing)) {
        return { locale: existing, wasSet: false };
    }

    const lang = await prisma.language.findUnique({
        where: { id: nativeLanguageId },
        select: { code: true },
    });
    const locale = lang?.code && SUPPORTED.includes(lang.code) ? lang.code : 'en';
    cookieStore.set('ui-locale', locale, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
    });
    return { locale, wasSet: true };
}

export async function clearLocaleAction(): Promise<void> {
    (await cookies()).delete('ui-locale');
}
