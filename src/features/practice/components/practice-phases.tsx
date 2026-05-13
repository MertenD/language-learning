"use client"

import { usePracticeSession } from "../hooks/use-practice-session";
import { VocabularySelector } from "./vocabulary-selector";
import { GameSelector } from "./game-selector";
import { FlashcardsGame } from "./games/flashcards";
import { MultipleChoiceGame } from "./games/multiple-choice";
import { TypingGame } from "./games/typing";
import { MatchingGame } from "./games/matching";
import { MemoryGame } from "./games/memory";
import { ScrambleGame } from "./games/scramble";
import { TrueFalseGame } from "./games/true-false";
import { HangmanGame } from "./games/hangman";
import { SpeedMatchGame } from "./games/speed-match";
import { ReverseChoiceGame } from "./games/reverse-choice";
import { MixedGame } from "./games/mixed";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PracticeHeader from "@/features/practice/components/practice-header";
import { SessionSummary } from "./session-summary";
import {useTranslations} from "next-intl";

export function PracticePhases() {
    const {
        selectedWords,
        gameType,
        isGameActive,
        isGameFinished,
        resetSession,
        setGameType
    } = usePracticeSession();
    const t = useTranslations('practice');

    // 1. Selection Phase
    if (selectedWords.length === 0) {
        return (
            <div className="space-y-8 md:space-y-16">
                <PracticeHeader />
                <VocabularySelector />
            </div>
        );
    }

    // 2. Game Selection Phase
    if (!gameType) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={resetSession}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{t('gameSelection.title')}</h1>
                        <p className="text-muted-foreground">{t('gameSelection.description', { count: selectedWords.length })}</p>
                    </div>
                </div>
                <GameSelector/>
            </div>
        );
    }

    // 3. Results Phase
    if (isGameFinished) {
        return <SessionSummary />;
    }

    // 4. Active Game Phase
    if (isGameActive) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => setGameType(null)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> {t('activeGame.quitButton')}
                    </Button>
                </div>

                <div className="py-8">
                    {gameType === 'flashcards' && <FlashcardsGame />}
                    {gameType === 'multiple-choice' && <MultipleChoiceGame />}
                    {gameType === 'typing' && <TypingGame />}
                    {gameType === 'matching' && <MatchingGame />}
                    {gameType === 'memory' && <MemoryGame />}
                    {gameType === 'scramble' && <ScrambleGame />}
                    {gameType === 'true-false' && <TrueFalseGame />}
                    {gameType === 'hangman' && <HangmanGame />}
                    {gameType === 'listening' && <SpeedMatchGame />}
                    {gameType === 'reverse-choice' && <ReverseChoiceGame />}
                    {gameType === 'mixed' && <MixedGame />}
                </div>
            </div>
        );
    }

    return null;
}
