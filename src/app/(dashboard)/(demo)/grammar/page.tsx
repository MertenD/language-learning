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

type WordsPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function WordsPage({ searchParams }: WordsPageProps) {
    await requireAuth()

    const params = await grammarParamsLoader(searchParams)
    prefetchGrammar(params)

    return <GrammarContainer>
        <HydrateClient>
            <ErrorBoundary fallback={<GrammarError />}>
                <Suspense fallback={<GrammarLoading />}>
                    <GrammarList />
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    </GrammarContainer>
}