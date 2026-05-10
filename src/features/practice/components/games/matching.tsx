"use client"

import { useState, useEffect } from "react";
import { usePracticeSession } from "../../hooks/use-practice-session";
import { useEndGame } from "../../hooks/use-end-game";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

    useEffect(() => {
        const currentBatch = selectedWords;

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
    }, [selectedWords]);

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
                    setTimeout(() => endGame(), 1000);
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

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Match the pairs</h2>
                <p className="text-muted-foreground">Select a primary word and its secondary translation</p>
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
