import 'server-only';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';

const SUPPORTED = ['en', 'de'];

export async function resolveAndPersistLocale(nativeLanguageId: string): Promise<void> {
    const cookieStore = await cookies();
    if (SUPPORTED.includes(cookieStore.get('ui-locale')?.value ?? '')) return;

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
}

export async function clearLocale(): Promise<void> {
    (await cookies()).delete('ui-locale');
}
