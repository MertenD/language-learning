"use client"

import { useState, useRef, useEffect } from "react";
import { usePracticeSession } from "../../hooks/use-practice-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle } from "lucide-react";

export function TypingGame() {
    const { selectedWords, currentWordIndex, nextWord, endGame, incrementScore } = usePracticeSession();
    const [input, setInput] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const currentWord = selectedWords[currentWordIndex];

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentWordIndex]);

    const handleCheck = () => {
        if (!currentWord) return;

        const correct = input.trim().toLowerCase() === currentWord.serbian.toLowerCase();
        setIsCorrect(correct);
        setIsChecked(true);

        if (correct) {
            incrementScore();
        }
    };

    const handleNext = () => {
        setInput("");
        setIsChecked(false);
        setIsCorrect(false);

        if (currentWordIndex < selectedWords.length - 1) {
            nextWord();
        } else {
            endGame();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            if (isChecked) {
                handleNext();
            } else {
                handleCheck();
            }
        }
    };

    if (!currentWord) return null;

    return (
        <div className="max-w-md mx-auto space-y-8">
            <div className="text-center mb-4">
                <span className="text-muted-foreground">
                    Word {currentWordIndex + 1} of {selectedWords.length}
                </span>
            </div>

            <Card>
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl">Type the translation</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-4 pb-8">
                    <h2 className="text-4xl font-bold text-primary mb-2">{currentWord.german}</h2>
                    {currentWord.germanInfo && (
                        <p className="text-muted-foreground">{currentWord.germanInfo}</p>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="relative">
                    <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type Serbian translation..."
                        className="h-14 text-lg text-center"
                        disabled={isChecked}
                        autoComplete="off"
                    />
                    {isChecked && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            {isCorrect ? (
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                            ) : (
                                <XCircle className="h-6 w-6 text-red-500" />
                            )}
                        </div>
                    )}
                </div>

                {isChecked && !isCorrect && (
                    <div className="p-4 bg-destructive/10 text-destructive rounded-md text-center">
                        <p className="font-semibold">Correct answer:</p>
                        <p className="text-xl">{currentWord.serbian}</p>
                        {currentWord.serbianInfo && <p className="text-sm">{currentWord.serbianInfo}</p>}
                    </div>
                )}

                <Button
                    className="w-full h-12 text-lg"
                    onClick={isChecked ? handleNext : handleCheck}
                    disabled={!input.trim()}
                >
                    {isChecked ? (currentWordIndex < selectedWords.length - 1 ? "Next Word" : "Finish") : "Check Answer"}
                </Button>
            </div>
        </div>
    );
}

