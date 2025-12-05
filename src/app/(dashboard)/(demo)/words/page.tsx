import {requireAuth} from "@/lib/auth-utils";
import {prefetchWords} from "@/features/words/servers/prefetch";
import {HydrateClient} from "@/trpc/server";
import {ErrorBoundary} from "react-error-boundary";
import {Suspense} from "react";
import {Spinner} from "@/components/ui/spinner";
import WordsList from "@/features/words/components/words-list";
import WordsContainer from "@/features/words/components/words-container";
import type {SearchParams} from "nuqs/server";
import {wordsParamsLoader} from "@/features/words/servers/params-loader";

type WordsPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function WordsPage({ searchParams }: WordsPageProps) {
    await requireAuth()

    const params = await wordsParamsLoader(searchParams)
    prefetchWords(params)

    return <WordsContainer>
        <HydrateClient>
            <ErrorBoundary fallback={<p>Error!</p>}>
                <Suspense fallback={<Spinner />}>
                    <WordsList />
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    </WordsContainer>
}