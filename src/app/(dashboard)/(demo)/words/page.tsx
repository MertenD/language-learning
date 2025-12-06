import {requireAuth} from "@/lib/auth-utils";
import {prefetchWords} from "@/features/words/server/prefetch";
import {HydrateClient} from "@/trpc/server";
import {ErrorBoundary} from "react-error-boundary";
import {Suspense} from "react";
import WordsList from "@/features/words/components/words-list";
import WordsContainer from "@/features/words/components/words-container";
import type {SearchParams} from "nuqs/server";
import {wordsParamsLoader} from "@/features/words/server/params-loader";
import WordsLoading from "@/features/words/components/words-loading";
import WordsError from "@/features/words/components/words-error";

type WordsPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function WordsPage({ searchParams }: WordsPageProps) {
    await requireAuth()

    const params = await wordsParamsLoader(searchParams)
    prefetchWords(params)

    return <WordsContainer>
        <HydrateClient>
            <ErrorBoundary fallback={<WordsError />}>
                <Suspense fallback={<WordsLoading />}>
                    <WordsList />
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    </WordsContainer>
}