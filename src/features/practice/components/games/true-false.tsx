"use client"

import { useState, useEffect } from "react";
import { usePracticeSession } from "../../hooks/use-practice-session";
import { useEndGame } from "../../hooks/use-end-game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export function TrueFalseGame() {
    const { selectedWords, currentWordIndex, nextWord, recordResult } = usePracticeSession();
    const endGame = useEndGame();
    const [displayedTranslation, setDisplayedTranslation] = useState("");
    const [isCorrectMatch, setIsCorrectMatch] = useState(false);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [userAnswer, setUserAnswer] = useState<boolean | null>(null);

    const currentWord = selectedWords[currentWordIndex];

    useEffect(() => {
        if (!currentWord) return;

        const otherWords = selectedWords.filter((w: any) => w.id !== currentWord.id);
        const showCorrect = otherWords.length === 0 ? true : Math.random() > 0.5;
        setIsCorrectMatch(showCorrect);

        if (showCorrect) {
            setDisplayedTranslation(currentWord.secondary);
        } else {
            const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
            setDisplayedTranslation(randomWord.secondary);
        }

        setHasAnswered(false);
        setUserAnswer(null);
    }, [currentWord, selectedWords]);

    const handleAnswer = (answer: boolean) => {
        if (hasAnswered) return;

        setHasAnswered(true);
        setUserAnswer(answer);

        const correct = answer === isCorrectMatch;
        recordResult(currentWord.id, correct);

        setTimeout(() => {
            if (currentWordIndex < selectedWords.length - 1) {
                nextWord();
            } else {
                endGame();
            }
        }, 1500);
    };

    if (!currentWord) return null;

    return (
        <div className="max-w-md mx-auto space-y-8">
            <div className="text-center mb-4">
                <span className="text-muted-foreground">
                    Word {currentWordIndex + 1} of {selectedWords.length}
                </span>
            </div>

            <Card className="text-center">
                <CardHeader>
                    <CardTitle className="text-muted-foreground">Is this correct?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 py-8">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">{currentWord.primary}</h2>
                        <div className="text-muted-foreground text-sm">equals</div>
                        <h2 className="text-3xl font-bold mt-2 text-primary">{displayedTranslation}</h2>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Button
                    variant={hasAnswered && userAnswer === false ? (isCorrectMatch === false ? "default" : "destructive") : "outline"}
                    className="h-24 text-xl border-red-200 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleAnswer(false)}
                    disabled={hasAnswered}
                >
                    <X className="mr-2 h-8 w-8" /> False
                </Button>
                <Button
                    variant={hasAnswered && userAnswer === true ? (isCorrectMatch === true ? "default" : "destructive") : "outline"}
                    className="h-24 text-xl border-green-200 hover:bg-green-50 hover:text-green-600"
                    onClick={() => handleAnswer(true)}
                    disabled={hasAnswered}
                >
                    <Check className="mr-2 h-8 w-8" /> True
                </Button>
            </div>

            {hasAnswered && (
                <div className="text-center font-medium animate-in fade-in slide-in-from-bottom-2 space-y-1">
                    {userAnswer === isCorrectMatch ? (
                        <span className="text-green-600 text-lg">Richtig! ✓</span>
                    ) : (
                        <>
                            <p className="text-red-600 text-lg">Falsch! Es war {isCorrectMatch ? "Wahr" : "Falsch"}</p>
                            <p className="text-muted-foreground text-sm">
                                {currentWord.primary} = <span className="font-semibold text-foreground">{currentWord.secondary}</span>
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
