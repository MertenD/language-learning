import {SearchParams} from "nuqs/server";
import {requireAuth} from "@/lib/auth-utils";
import {grammarParamsLoader} from "@/features/grammar/server/params-loader";
import {prefetchGrammar} from "@/features/grammar/server/prefetch";
import {HydrateClient} from "@/trpc/server";
import {ErrorBoundary} from "react-error-boundary";
import {Suspense} from "react";
import GrammarError from "@/features/grammar/components/grammar-error";
import GrammarLoading from "@/features/grammar/components/grammar-loading";
import GrammarList from "@/features/grammar/components/grammar-list";
import GrammarContainer from "@/features/grammar/components/grammar-container";
import AppHeader from "@/components/app-header";

type WordsPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function GrammarPage({ searchParams }: WordsPageProps) {
    await requireAuth()

    const breadcrumbs = [
        { title: 'Grammar', url: '/grammar' }
    ]

    const params = await grammarParamsLoader(searchParams)
    prefetchGrammar(params)

    return <>
        <AppHeader breadcrumbs={breadcrumbs} />
        <main className="flex-1">
            <GrammarContainer>
                <HydrateClient>
                    <ErrorBoundary fallback={<GrammarError />}>
                        <Suspense fallback={<GrammarLoading />}>
                            <GrammarList />
                        </Suspense>
                    </ErrorBoundary>
                </HydrateClient>
            </GrammarContainer>
        </main>
    </>
}