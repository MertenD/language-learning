"use client"

import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setLocaleAction } from '@/app/actions/set-locale';

export function LocaleSetter({ nativeLanguageId }: { nativeLanguageId: string }) {
    const router = useRouter();
    const [, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const { wasSet } = await setLocaleAction(nativeLanguageId);
            if (wasSet) router.refresh();
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nativeLanguageId]);

    return null;
}
