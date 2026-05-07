"use client"

import { useState, useEffect } from "react";
import { usePracticeSession } from "../../hooks/use-practice-session";
import { useEndGame } from "../../hooks/use-end-game";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function SpeedMatchGame() {
    const { selectedWords, incrementScore } = usePracticeSession();
    const endGame = useEndGame();
    const [currentPair, setCurrentPair] = useState<{ primary: string, secondary: string, isMatch: boolean } | null>(null);
    const [timeLeft, setTimeLeft] = useState(100);
    const [score, setLocalScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [round, setRound] = useState(0);

    const maxRounds = 20;

    useEffect(() => {
        if (gameOver) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    setGameOver(true);
                    return 0;
                }
                return prev - 0.5;
            });
        }, 50);

        return () => clearInterval(timer);
    }, [gameOver]);

    useEffect(() => {
        generatePair();
    }, []);

    const generatePair = () => {
        if (round >= maxRounds) {
            setGameOver(true);
            return;
        }

        const randomWord = selectedWords[Math.floor(Math.random() * selectedWords.length)];
        const isMatch = Math.random() > 0.5;

        let secondary = randomWord.secondary;
        if (!isMatch && selectedWords.length > 1) {
            const otherWords = selectedWords.filter((w: any) => w.id !== randomWord.id);
            secondary = otherWords[Math.floor(Math.random() * otherWords.length)].secondary;
        }

        setCurrentPair({
            primary: randomWord.primary,
            secondary,
            isMatch
        });
        setRound(r => r + 1);
        setTimeLeft(100);
    };

    const handleAnswer = (answer: boolean) => {
        if (!currentPair || gameOver) return;

        if (answer === currentPair.isMatch) {
            setLocalScore(s => s + 1);
            incrementScore();
        } else {
            setTimeLeft(prev => Math.max(0, prev - 20));
        }
        generatePair();
    };

    useEffect(() => {
        if (gameOver) {
            setTimeout(() => endGame(), 2000);
        }
    }, [gameOver, endGame]);

    if (!currentPair) return null;

    if (gameOver) {
        return (
            <div className="text-center space-y-6 py-12">
                <h2 className="text-4xl font-bold">Time's Up!</h2>
                <p className="text-2xl">Final Score: {score}</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto space-y-8">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Round {round}/{maxRounds}</span>
                <span>Score: {score}</span>
            </div>

            <Progress value={timeLeft} className="h-3" />

            <Card className="text-center py-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />
                <CardContent className="space-y-6 pt-6">
                    <div className="text-center space-y-4">
                        <div className="p-6 bg-secondary/20 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Word</p>
                            <h3 className="text-3xl font-bold">{currentPair.primary}</h3>
                        </div>

                        <div className="p-6 bg-secondary/20 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Translation</p>
                            <h3 className="text-3xl font-bold text-primary">{currentPair.secondary}</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="destructive"
                            className="h-20 text-xl"
                            onClick={() => handleAnswer(false)}
                        >
                            No Match
                        </Button>
                        <Button
                            variant="default"
                            className="h-20 text-xl bg-green-600 hover:bg-green-700"
                            onClick={() => handleAnswer(true)}
                        >
                            Match
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
