"use client"

import { useState, useEffect } from "react";
import { usePracticeSession } from "../../hooks/use-practice-session";
import { useEndGame } from "../../hooks/use-end-game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ScrambleGame() {
    const { selectedWords, currentWordIndex, nextWord, recordResult } = usePracticeSession();
    const endGame = useEndGame();
    const [scrambled, setScrambled] = useState("");
    const [input, setInput] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const currentWord = selectedWords[currentWordIndex];

    useEffect(() => {
        if (!currentWord) return;

        const word = currentWord.secondary;
        const shuffled = word.split('').sort(() => 0.5 - Math.random()).join('');
        setScrambled(shuffled === word && word.length > 1 ? word.split('').reverse().join('') : shuffled);

        setInput("");
        setIsChecked(false);
        setIsCorrect(false);
    }, [currentWord]);

    const handleCheck = () => {
        if (!currentWord) return;

        const correct = input.trim().toLowerCase() === currentWord.secondary.toLowerCase();
        setIsCorrect(correct);
        setIsChecked(true);
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
                    Word {currentWordIndex + 1} of {selectedWords.length}
                </span>
            </div>

            <Card>
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl">Unscramble the word</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-4 pb-8">
                    <h2 className="text-4xl font-bold text-primary mb-2 tracking-widest">{scrambled}</h2>
                    <p className="text-muted-foreground mt-4">Translation for: <span className="font-semibold text-foreground">{currentWord.primary}</span></p>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type the unscrambled word..."
                    className="h-14 text-lg text-center"
                    disabled={isChecked}
                    onKeyDown={(e) => e.key === "Enter" && !isChecked && handleCheck()}
                />

                {isChecked && (
                    <div className={`p-4 rounded-md text-center ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        <p className="font-bold">{isCorrect ? "Correct!" : "Incorrect"}</p>
                        {!isCorrect && <p>Answer: {currentWord.secondary}</p>}
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
