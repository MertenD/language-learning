"use client"

import { useState, useEffect, useMemo } from "react";
import { usePracticeSession } from "../../hooks/use-practice-session";
import { useEndGame } from "../../hooks/use-end-game";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const WAVE_SIZE = 5;

type MatchItem = {
    id: string;
    text: string;
    type: 'primary' | 'secondary';
    wordId: string;
    matched: boolean;
};

export function MatchingGame() {
    const { selectedWords, recordResult } = usePracticeSession();
    const endGame = useEndGame();
    const [items, setItems] = useState<MatchItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [wrongPair, setWrongPair] = useState<string[]>([]);
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
        const currentBatch = waves[currentWaveIndex];

        const newItems: MatchItem[] = [];
        currentBatch.forEach((word: any) => {
            newItems.push({
                id: `p-${word.id}`,
                text: word.primary,
                type: 'primary',
                wordId: word.id,
                matched: false
            });
            newItems.push({
                id: `s-${word.id}`,
                text: word.secondary,
                type: 'secondary',
                wordId: word.id,
                matched: false
            });
        });

        setItems(newItems.sort(() => 0.5 - Math.random()));
        setSelectedId(null);
        setWrongPair([]);
    }, [currentWaveIndex, waves]);

    const handleItemClick = (id: string) => {
        if (wrongPair.length > 0) {
            setWrongPair([]);
            setSelectedId(null);
        }

        const clickedItem = items.find(i => i.id === id);
        if (!clickedItem || clickedItem.matched) return;

        if (selectedId === null) {
            setSelectedId(id);
        } else if (selectedId === id) {
            setSelectedId(null);
        } else {
            const firstItem = items.find(i => i.id === selectedId);
            if (!firstItem) return;

            if (firstItem.wordId === clickedItem.wordId && firstItem.type !== clickedItem.type) {
                const updatedItems = items.map(item =>
                    (item.id === id || item.id === selectedId)
                        ? { ...item, matched: true }
                        : item
                );
                setItems(updatedItems);
                recordResult(firstItem.wordId, true);
                setSelectedId(null);

                const allMatched = updatedItems.every(i => i.matched);
                if (allMatched) {
                    const newTotal = totalMatchedPairs + (waves[currentWaveIndex]?.length ?? 0);
                    setTotalMatchedPairs(newTotal);
                    const isLastWave = currentWaveIndex >= waves.length - 1;
                    if (isLastWave) {
                        setTimeout(() => endGame(), 800);
                    } else {
                        setTimeout(() => setShowWaveComplete(true), 800);
                    }
                }
            } else {
                setWrongPair([selectedId, id]);
                setTimeout(() => {
                    setWrongPair([]);
                    setSelectedId(null);
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
                <h2 className="text-2xl font-bold">Match the pairs</h2>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((item) => (
                    <Button
                        key={item.id}
                        variant="outline"
                        className={cn(
                            "h-24 text-lg whitespace-normal p-2",
                            item.matched && "invisible",
                            selectedId === item.id && "border-primary bg-primary/10 ring-2 ring-primary",
                            wrongPair.includes(item.id) && "border-destructive bg-destructive/10 text-destructive animate-shake"
                        )}
                        onClick={() => handleItemClick(item.id)}
                        disabled={item.matched}
                    >
                        {item.text}
                    </Button>
                ))}
            </div>
        </div>
    );
}
