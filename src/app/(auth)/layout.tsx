import React from "react";
import Link from "next/link";
import Image from "next/image";
import {getTranslations} from "next-intl/server";

export default async function AuthLayout({ children }: { children: React.ReactNode}) {
    const t = await getTranslations('auth.layout');
    return <div className="bg-muted flex min-h-svh flex-col justify-center items-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 self-center font-medium">
                <Image src="/logos/logo.svg" alt="App Logo" width={20} height={20} />
                {t('brand')}
            </Link>
            {children}
        </div>
    </div>
}
