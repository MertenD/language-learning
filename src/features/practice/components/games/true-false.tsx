"use client"

import { useState, useEffect } from "react";
import { usePracticeSession } from "../../hooks/use-practice-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export function TrueFalseGame() {
    const { selectedWords, currentWordIndex, nextWord, endGame, incrementScore } = usePracticeSession();
    const [displayedTranslation, setDisplayedTranslation] = useState("");
    const [isCorrectMatch, setIsCorrectMatch] = useState(false);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [userAnswer, setUserAnswer] = useState<boolean | null>(null);

    const currentWord = selectedWords[currentWordIndex];

    useEffect(() => {
        if (!currentWord) return;

        // 50% chance to show correct translation
        const showCorrect = Math.random() > 0.5;
        setIsCorrectMatch(showCorrect);

        if (showCorrect) {
            setDisplayedTranslation(currentWord.serbian);
        } else {
            // Pick a random wrong translation
            const otherWords = selectedWords.filter((w: any) => w.id !== currentWord.id);
            if (otherWords.length > 0) {
                const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
                setDisplayedTranslation(randomWord.serbian);
            } else {
                // Fallback if only 1 word selected (shouldn't happen often in practice)
                setDisplayedTranslation("Wrong Answer");
                setIsCorrectMatch(false);
            }
        }

        setHasAnswered(false);
        setUserAnswer(null);
    }, [currentWord, selectedWords]);

    const handleAnswer = (answer: boolean) => {
        if (hasAnswered) return;

        setHasAnswered(true);
        setUserAnswer(answer);

        if (answer === isCorrectMatch) {
            incrementScore();
        }

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
                        <h2 className="text-3xl font-bold mb-2">{currentWord.german}</h2>
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
                <div className="text-center font-medium animate-in fade-in slide-in-from-bottom-2">
                    {userAnswer === isCorrectMatch ? (
                        <span className="text-green-600 text-lg">Correct!</span>
                    ) : (
                        <span className="text-red-600 text-lg">Wrong! It was {isCorrectMatch ? "True" : "False"}</span>
                    )}
                </div>
            )}
        </div>
    );
}

