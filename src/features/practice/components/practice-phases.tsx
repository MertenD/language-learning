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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, RotateCcw, ArrowLeft } from "lucide-react";
import PracticeHeader from "@/features/practice/components/practice-header";

export function PracticePhases() {
    const {
        selectedWords,
        gameType,
        isGameActive,
        isGameFinished,
        score,
        resetSession,
        setGameType
    } = usePracticeSession();

    // 1. Selection Phase
    if (selectedWords.length === 0) {
        return (
            <div className="space-y-16">
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
                        <h1 className="text-2xl font-bold tracking-tight">Choose a Game</h1>
                        <p className="text-muted-foreground">Select how you want to practice these {selectedWords.length} words.</p>
                    </div>
                </div>
                <GameSelector/>
            </div>
        );
    }

    // 3. Results Phase
    if (isGameFinished) {
        const percentage = selectedWords.length > 0
            ? Math.round((score / selectedWords.length) * 100)
            : 0;

        const XP_MULTIPLIERS: Record<string, number> = {
            flashcards: 0.5, "multiple-choice": 1.0, "true-false": 1.0,
            "reverse-choice": 1.0, typing: 1.5, scramble: 1.5, hangman: 1.5,
            memory: 1.2, matching: 1.2, listening: 1.0,
        };
        const multiplier = gameType ? (XP_MULTIPLIERS[gameType] ?? 1.0) : 1.0;
        const xpEarned = Math.round(score * 10 * multiplier);

        return (
            <div className="max-w-md mx-auto text-center space-y-8 py-12">
                <div className="flex justify-center">
                    <div className="bg-primary/10 p-6 rounded-full">
                        <Trophy className="h-16 w-16 text-primary" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-bold">Session Complete!</h2>
                    <p className="text-muted-foreground">Here is how you performed</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Score</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="text-5xl font-bold text-primary mb-2">
                            {score} / {selectedWords.length}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {percentage}% Correct
                        </p>
                        <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-semibold">
                            +{xpEarned} XP
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-3">
                    <Button size="lg" onClick={() => setGameType(null)} className="w-full">
                        <RotateCcw className="mr-2 h-4 w-4" /> Play Another Game
                    </Button>
                    <Button variant="outline" size="lg" onClick={resetSession} className="w-full">
                        Select Different Words
                    </Button>
                </div>
            </div>
        );
    }

    // 4. Active Game Phase
    if (isGameActive) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => setGameType(null)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Quit Game
                    </Button>
                    <div className="text-sm font-medium text-muted-foreground">
                        Playing: {gameType.replace('-', ' ').toUpperCase()}
                    </div>
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
                </div>
            </div>
        );
    }

    return null;
}
