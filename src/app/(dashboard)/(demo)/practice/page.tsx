import {PracticePhases} from "@/features/practice/components/practice-phases";
import PracticeContainer from "@/features/practice/components/practice-container";
import {requireAuth} from "@/lib/auth-utils";
import AppHeader from "@/components/app-header";

export default async function LearnVocabularyPage() {
    await requireAuth()

    const breadcrumbs = [
        { title: 'Practice', url: '/practice' }
    ]

    return <>
        <AppHeader breadcrumbs={breadcrumbs} />
        <main className="flex-1">
            <PracticeContainer>
                <PracticePhases />
            </PracticeContainer>
        </main>
    </>
}

