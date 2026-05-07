"use client"

import { useState, useEffect } from "react";
import { usePracticeSession } from "../../hooks/use-practice-session";
import { useEndGame } from "../../hooks/use-end-game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReverseChoiceGame() {
    const { selectedWords, currentWordIndex, nextWord, recordResult } = usePracticeSession();
    const endGame = useEndGame();
    const [options, setOptions] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const currentWord = selectedWords[currentWordIndex];

    useEffect(() => {
        if (!currentWord) return;

        const distractors = selectedWords
            .filter((w: any) => w.id !== currentWord.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map((w: any) => w.primary);

        const allOptions = [currentWord.primary, ...distractors]
            .sort(() => 0.5 - Math.random());

        setOptions(allOptions);
        setSelectedOption(null);
        setIsAnswered(false);
    }, [currentWord, selectedWords]);

    const handleOptionClick = (option: string) => {
        if (isAnswered) return;

        const correct = option === currentWord.primary;
        setSelectedOption(option);
        setIsAnswered(true);
        recordResult(currentWord.id, correct);
    };

    const handleNext = () => {
        if (currentWordIndex < selectedWords.length - 1) {
            nextWord();
        } else {
            endGame();
        }
    };

    if (!currentWord) return null;

    return (
        <div className="max-w-md mx-auto space-y-8">
            <div className="text-center mb-4">
                <span className="text-muted-foreground">
                    Question {currentWordIndex + 1} of {selectedWords.length}
                </span>
            </div>

            <Card>
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl">Select the primary translation</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-4 pb-8">
                    <h2 className="text-4xl font-bold text-primary">{currentWord.secondary}</h2>
                    {currentWord.secondaryInfo && (
                        <p className="text-muted-foreground mt-2">{currentWord.secondaryInfo}</p>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-3">
                {options.map((option, index) => {
                    let variant: "outline" | "default" | "destructive" | "secondary" = "outline";

                    if (isAnswered) {
                        if (option === currentWord.primary) {
                            variant = "default";
                        } else if (option === selectedOption) {
                            variant = "destructive";
                        }
                    }

                    return (
                        <Button
                            key={index}
                            variant={variant}
                            className={cn(
                                "h-14 text-lg justify-start px-6",
                                isAnswered && option === currentWord.primary && "bg-green-600 hover:bg-green-700 text-white",
                                isAnswered && option === selectedOption && option !== currentWord.primary && "bg-red-500 hover:bg-red-600 text-white"
                            )}
                            onClick={() => handleOptionClick(option)}
                            disabled={isAnswered}
                        >
                            {option}
                        </Button>
                    );
                })}
            </div>

            {isAnswered && (
                <div className="flex justify-end">
                    <Button onClick={handleNext} size="lg">
                        {currentWordIndex < selectedWords.length - 1 ? "Next Question" : "Finish Quiz"}
                    </Button>
                </div>
            )}
        </div>
    );
}
