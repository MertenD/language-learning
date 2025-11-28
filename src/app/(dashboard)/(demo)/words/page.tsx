import {requireAuth} from "@/lib/auth-utils";
import {prefetchWords} from "@/features/words/servers/prefetch";
import {HydrateClient} from "@/trpc/server";
import {ErrorBoundary} from "react-error-boundary";
import {Suspense} from "react";
import {Spinner} from "@/components/ui/spinner";
import WordsList from "@/features/words/components/words-list";
import WordsContainer from "@/features/words/components/words-container";

export default async function WordsPage() {
    await requireAuth()

    prefetchWords()

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