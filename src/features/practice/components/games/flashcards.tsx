"use client"

import { useState } from "react";
import { usePracticeSession } from "../../hooks/use-practice-session";
import { useEndGame } from "../../hooks/use-end-game";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw } from "lucide-react";

export function FlashcardsGame() {
    const { selectedWords, currentWordIndex, nextWord, recordResult } = usePracticeSession();
    const endGame = useEndGame();
    const [isFlipped, setIsFlipped] = useState(false);

    const currentWord = selectedWords[currentWordIndex];

    const handleNext = (correct: boolean) => {
        recordResult(currentWord.id, correct);
        setIsFlipped(false);
        if (currentWordIndex < selectedWords.length - 1) {
            nextWord();
        } else {
            endGame();
        }
    };

    if (!currentWord) return null;

    return (
        <div className="flex flex-col items-center justify-center space-y-8 max-w-md mx-auto">
            <div className="text-center mb-4">
                <span className="text-muted-foreground">
                    Card {currentWordIndex + 1} of {selectedWords.length}
                </span>
            </div>

            <div
                className="relative w-full h-64 cursor-pointer perspective-1000"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <motion.div
                    className="w-full h-full relative preserve-3d"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {/* Front */}
                    <Card className="absolute w-full h-full backface-hidden flex items-center justify-center">
                        <CardContent className="text-center p-6">
                            <h2 className="text-3xl font-bold mb-2">{currentWord.primary}</h2>
                            {currentWord.primaryInfo && (
                                <p className="text-muted-foreground">{currentWord.primaryInfo}</p>
                            )}
                            <p className="text-sm text-muted-foreground mt-8">(Click to flip)</p>
                        </CardContent>
                    </Card>

                    {/* Back */}
                    <Card
                        className="absolute w-full h-full backface-hidden flex items-center justify-center"
                        style={{ transform: "rotateY(180deg)" }}
                    >
                        <CardContent className="text-center p-6">
                            <h2 className="text-3xl font-bold mb-2">{currentWord.secondary}</h2>
                            {currentWord.secondaryInfo && (
                                <p className="text-muted-foreground">{currentWord.secondaryInfo}</p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <div className="flex flex-col items-center gap-3 w-full">
                <Button variant="outline" onClick={() => setIsFlipped(!isFlipped)}>
                    <RotateCw className="mr-2 h-4 w-4" /> Flip
                </Button>
                {isFlipped && (
                    <div className="flex gap-4">
                        <Button variant="destructive" onClick={() => handleNext(false)}>
                            Still learning ✗
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleNext(true)}>
                            Got it ✓
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
