"use client"

import { useState, useEffect, useMemo } from "react";
import { usePracticeSession } from "../../hooks/use-practice-session";
import { useEndGame } from "../../hooks/use-end-game";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

    const gridCols = useMemo(() => {
        const n = cards.length;
        if (n <= 4) return 'grid-cols-2';
        if (n <= 6) return 'grid-cols-3';
        return 'grid-cols-4';
    }, [cards.length]);

    useEffect(() => {
        const gameWords = selectedWords;

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
    }, [selectedWords]);

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
                    setCards(prev => prev.map(c =>
                        (c.id === firstId || c.id === secondId)
                            ? { ...c, isMatched: true }
                            : c
                    ));
                    setFlippedIds([]);
                    setIsProcessing(false);

                    if (newCards.filter(c => !c.isMatched).length === 2) {
                        setTimeout(() => endGame(), 500);
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

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Memory Game</h2>
                <p className="text-muted-foreground">Find matching pairs by flipping cards</p>
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
