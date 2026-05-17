"use client"

import { useState, useEffect, useMemo } from "react";
import { usePracticeSession } from "../../hooks/use-practice-session";
import { useEndGame } from "../../hooks/use-end-game";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const WAVE_SIZE = 5;

type MemoryCard = {
    id: string;
    text: string;
    wordId: string;
    isFlipped: boolean;
    isMatched: boolean;
};

export function MemoryGame() {
    const { selectedWords, recordResult } = usePracticeSession();
    const endGame = useEndGame();
    const [cards, setCards] = useState<MemoryCard[]>([]);
    const [flippedIds, setFlippedIds] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentWaveIndex, setCurrentWaveIndex] = useState(0);
    const [showWaveComplete, setShowWaveComplete] = useState(false);
    const [totalMatchedPairs, setTotalMatchedPairs] = useState(0);

    const waves = useMemo(() => {
        const result = [];
        for (let i = 0; i < selectedWords.length; i += WAVE_SIZE) {
            result.push(selectedWords.slice(i, i + WAVE_SIZE));
        }
        return result;
    }, [selectedWords]);

    const totalPairs = selectedWords.length;

    useEffect(() => {
        if (waves.length === 0) return;
        const gameWords = waves[currentWaveIndex];

        const newCards: MemoryCard[] = [];
        gameWords.forEach((word: any) => {
            newCards.push({
                id: `p-${word.id}`,
                text: word.primary,
                wordId: word.id,
                isFlipped: false,
                isMatched: false
            });
            newCards.push({
                id: `s-${word.id}`,
                text: word.secondary,
                wordId: word.id,
                isFlipped: false,
                isMatched: false
            });
        });

        setCards(newCards.sort(() => 0.5 - Math.random()));
        setFlippedIds([]);
        setIsProcessing(false);
    }, [currentWaveIndex, waves]);

    const gridCols = useMemo(() => {
        const n = cards.length;
        if (n <= 4) return 'grid-cols-2';
        if (n <= 6) return 'grid-cols-3';
        return 'grid-cols-4';
    }, [cards.length]);

    const handleCardClick = (id: string) => {
        if (isProcessing) return;

        const clickedCard = cards.find(c => c.id === id);
        if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

        const newCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
        setCards(newCards);

        const newFlippedIds = [...flippedIds, id];
        setFlippedIds(newFlippedIds);

        if (newFlippedIds.length === 2) {
            setIsProcessing(true);
            const [firstId, secondId] = newFlippedIds;
            const firstCard = newCards.find(c => c.id === firstId);
            const secondCard = newCards.find(c => c.id === secondId);

            if (firstCard && secondCard && firstCard.wordId === secondCard.wordId) {
                recordResult(firstCard.wordId, true);
                setTimeout(() => {
                    const updatedCards = newCards.map(c =>
                        (c.id === firstId || c.id === secondId)
                            ? { ...c, isMatched: true }
                            : c
                    );
                    setCards(updatedCards);
                    setFlippedIds([]);
                    setIsProcessing(false);

                    const allMatched = updatedCards.every(c => c.isMatched);
                    if (allMatched) {
                        const newTotal = totalMatchedPairs + (waves[currentWaveIndex]?.length ?? 0);
                        setTotalMatchedPairs(newTotal);
                        const isLastWave = currentWaveIndex >= waves.length - 1;
                        if (isLastWave) {
                            setTimeout(() => endGame(), 500);
                        } else {
                            setTimeout(() => setShowWaveComplete(true), 500);
                        }
                    }
                }, 500);
            } else {
                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        (c.id === firstId || c.id === secondId)
                            ? { ...c, isFlipped: false }
                            : c
                    ));
                    setFlippedIds([]);
                    setIsProcessing(false);
                }, 1000);
            }
        }
    };

    const handleNextWave = () => {
        setShowWaveComplete(false);
        setCurrentWaveIndex(prev => prev + 1);
    };

    const progressPercent = totalPairs > 0 ? Math.round((totalMatchedPairs / totalPairs) * 100) : 0;
    const remainingWaves = waves.length - currentWaveIndex - 1;

    if (showWaveComplete) {
        return (
            <div className="max-w-md mx-auto text-center flex flex-col items-center gap-6 py-12">
                <div className="text-5xl">🎉</div>
                <h2 className="text-2xl font-bold">Runde {currentWaveIndex + 1} geschafft!</h2>
                <div className="w-full">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>{totalMatchedPairs} von {totalPairs} Paaren gefunden</span>
                        <span>{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-3" />
                </div>
                <p className="text-muted-foreground">
                    Noch {remainingWaves} Runde{remainingWaves !== 1 ? "n" : ""} übrig
                </p>
                <Button size="lg" onClick={handleNextWave}>
                    Weiter →
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Memory Game</h2>
                {waves.length > 1 && (
                    <p className="text-muted-foreground mt-1">
                        Runde {currentWaveIndex + 1} von {waves.length}
                    </p>
                )}
                <div className="max-w-sm mx-auto mt-3">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>{totalMatchedPairs} von {totalPairs} Paaren</span>
                        <span>{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                </div>
            </div>

            <div className={cn("grid gap-4", gridCols)}>
                {cards.map((card) => (
                    <div
                        key={card.id}
                        className="aspect-square cursor-pointer perspective-1000"
                        onClick={() => handleCardClick(card.id)}
                    >
                        <motion.div
                            className="w-full h-full relative preserve-3d"
                            animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                            transition={{ duration: 0.4 }}
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            <Card className="absolute w-full h-full backface-hidden bg-primary flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full border-2 border-primary-foreground/30" />
                            </Card>

                            <Card
                                className={cn(
                                    "absolute w-full h-full backface-hidden flex items-center justify-center p-2 text-center",
                                    card.isMatched && "bg-green-100 dark:bg-green-900/20 border-green-500"
                                )}
                                style={{ transform: "rotateY(180deg)" }}
                            >
                                <span className="text-sm sm:text-base font-medium select-none">
                                    {card.text}
                                </span>
                            </Card>
                        </motion.div>
                    </div>
                ))}
            </div>
        </div>
    );
}
