"use client"

import { useState, useEffect } from "react";
import { usePracticeSession } from "../../hooks/use-practice-session";
import { useEndGame } from "../../hooks/use-end-game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ALPHABET = "ABCČĆDĐEFGHIJKLMNOPQRSŠTUVWXYZŽ".split("");

export function HangmanGame() {
    const { selectedWords, currentWordIndex, nextWord, recordResult } = usePracticeSession();
    const endGame = useEndGame();
    const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
    const [wrongGuesses, setWrongGuesses] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isWon, setIsWon] = useState(false);

    const currentWord = selectedWords[currentWordIndex];
    const maxWrong = 6;

    useEffect(() => {
        setGuessedLetters(new Set());
        setWrongGuesses(0);
        setIsFinished(false);
        setIsWon(false);
    }, [currentWord]);

    const handleGuess = (letter: string) => {
        if (isFinished || guessedLetters.has(letter)) return;

        const newGuessed = new Set(guessedLetters);
        newGuessed.add(letter);
        setGuessedLetters(newGuessed);

        const normalizedWord = currentWord.secondary.toUpperCase();
        if (!normalizedWord.includes(letter)) {
            const newWrong = wrongGuesses + 1;
            setWrongGuesses(newWrong);
            if (newWrong >= maxWrong) {
                setIsFinished(true);
                setIsWon(false);
                recordResult(currentWord.id, false);
            }
        } else {
            const isComplete = normalizedWord.split('').every((char: string) =>
                !ALPHABET.includes(char) || newGuessed.has(char)
            );
            if (isComplete) {
                setIsFinished(true);
                setIsWon(true);
                recordResult(currentWord.id, true);
            }
        }
    };

    const handleNext = () => {
        if (currentWordIndex < selectedWords.length - 1) {
            nextWord();
        } else {
            endGame();
        }
    };

    if (!currentWord) return null;

    const displayWord = currentWord.secondary.split('').map((char: string) => {
        const upperChar = char.toUpperCase();
        if (!ALPHABET.includes(upperChar)) return char;
        return guessedLetters.has(upperChar) ? char : "_";
    }).join(" ");

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center mb-4">
                <span className="text-muted-foreground">
                    Word {currentWordIndex + 1} of {selectedWords.length}
                </span>
            </div>

            <Card>
                <CardHeader className="text-center">
                    <CardTitle>Guess the word</CardTitle>
                    <p className="text-muted-foreground">Translate: <span className="font-bold text-foreground">{currentWord.primary}</span></p>
                </CardHeader>
                <CardContent className="text-center space-y-8">
                    <div className="text-4xl font-mono tracking-widest py-4">
                        {isFinished && !isWon ? currentWord.secondary.split('').join(' ') : displayWord}
                    </div>

                    <div className="flex justify-center gap-1">
                        {Array.from({ length: maxWrong }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-3 w-3 rounded-full ${i < wrongGuesses ? "bg-red-500" : "bg-gray-200"}`}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-wrap justify-center gap-2">
                {ALPHABET.map((letter) => (
                    <Button
                        key={letter}
                        variant={guessedLetters.has(letter) ? "secondary" : "outline"}
                        className="w-10 h-10 p-0"
                        disabled={isFinished || guessedLetters.has(letter)}
                        onClick={() => handleGuess(letter)}
                    >
                        {letter}
                    </Button>
                ))}
            </div>

            {isFinished && (
                <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className={`text-xl font-bold ${isWon ? "text-green-600" : "text-red-600"}`}>
                        {isWon ? "You got it!" : "Out of attempts!"}
                    </div>
                    <Button size="lg" onClick={handleNext}>
                        {currentWordIndex < selectedWords.length - 1 ? "Next Word" : "Finish Game"}
                    </Button>
                </div>
            )}
        </div>
    );
}
