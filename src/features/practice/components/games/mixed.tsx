"use client"

import { useState, useEffect, useRef } from "react";
import { usePracticeSession } from "../../hooks/use-practice-session";
import { useEndGame } from "../../hooks/use-end-game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, X, CheckCircle2, XCircle, Eye, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { Word } from "@/generated/prisma/client";

type MiniType = 'multiple-choice' | 'true-false' | 'typing' | 'flashcard';

const MINI_LABELS: Record<MiniType, string> = {
    'multiple-choice': 'Multiple Choice',
    'true-false': 'Wahr oder Falsch',
    typing: 'Tippen',
    flashcard: 'Karteikarte',
};

const MINI_COLORS: Record<MiniType, string> = {
    'multiple-choice': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'true-false': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    typing: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    flashcard: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
};

function pickMiniType(allWords: Word[]): MiniType {
    const canUseDistractors = allWords.length >= 2;
    const pool: MiniType[] = canUseDistractors
        ? ['multiple-choice', 'multiple-choice', 'true-false', 'true-false', 'typing', 'typing', 'typing', 'flashcard']
        : ['typing', 'typing', 'typing', 'flashcard', 'flashcard'];
    return pool[Math.floor(Math.random() * pool.length)];
}

// ── Mini: Multiple Choice ────────────────────────────────────────────────────

function MiniMultipleChoice({ word, allWords, onResult }: {
    word: Word; allWords: Word[]; onResult: (correct: boolean) => void;
}) {
    const [options] = useState<string[]>(() => {
        const distractors = [...new Set(
            allWords
                .filter(w => w.id !== word.id)
                .sort(() => 0.5 - Math.random())
                .map(w => w.secondary)
                .filter(s => s !== word.secondary)
        )].slice(0, 3);
        return [word.secondary, ...distractors].sort(() => 0.5 - Math.random());
    });
    const [selected, setSelected] = useState<string | null>(null);

    const handleClick = (opt: string) => {
        if (selected) return;
        setSelected(opt);
        onResult(opt === word.secondary);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl text-muted-foreground">Was ist die Übersetzung?</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-2 pb-6">
                    <h2 className="text-4xl font-bold text-primary">{word.primary}</h2>
                    {word.primaryInfo && <p className="text-muted-foreground mt-2 text-sm">{word.primaryInfo}</p>}
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 gap-3">
                {options.map((opt) => {
                    const isCorrect = opt === word.secondary;
                    const isSelected = opt === selected;
                    return (
                        <Button
                            key={opt}
                            variant="outline"
                            className={cn(
                                "h-14 text-base justify-start px-5 transition-colors",
                                selected && isCorrect && "bg-green-600 hover:bg-green-600 text-white border-green-600",
                                selected && isSelected && !isCorrect && "bg-red-500 hover:bg-red-500 text-white border-red-500",
                            )}
                            onClick={() => handleClick(opt)}
                            disabled={!!selected}
                        >
                            {opt}
                        </Button>
                    );
                })}
            </div>
            {selected && (
                <div className={cn(
                    "text-center font-medium animate-in fade-in",
                    selected === word.secondary ? "text-green-600" : "text-red-600"
                )}>
                    {selected === word.secondary ? "Richtig! ✓" : `Falsch! Richtig: ${word.secondary}`}
                </div>
            )}
        </div>
    );
}

// ── Mini: True / False ───────────────────────────────────────────────────────

function MiniTrueFalse({ word, allWords, onResult }: {
    word: Word; allWords: Word[]; onResult: (correct: boolean) => void;
}) {
    const [[displayedTranslation, correctMatch]] = useState<[string, boolean]>(() => {
        const others = allWords.filter(w => w.id !== word.id);
        const isC = others.length === 0 ? true : Math.random() > 0.5;
        if (isC) return [word.secondary, true];
        const rnd = others[Math.floor(Math.random() * others.length)];
        return [rnd.secondary, false];
    });
    const [answered, setAnswered] = useState<boolean | null>(null);

    const handleAnswer = (answer: boolean) => {
        if (answered !== null) return;
        setAnswered(answer);
        onResult(answer === correctMatch);
    };

    return (
        <div className="space-y-6">
            <Card className="text-center">
                <CardHeader>
                    <CardTitle className="text-muted-foreground text-lg">Stimmt das?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 py-6">
                    <h2 className="text-3xl font-bold">{word.primary}</h2>
                    <p className="text-muted-foreground text-sm">=</p>
                    <h2 className="text-3xl font-bold text-primary">{displayedTranslation}</h2>
                </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-4">
                <Button
                    variant="outline"
                    className={cn(
                        "h-20 text-xl border-red-200 hover:bg-red-50 hover:text-red-600",
                        answered !== null && answered === false && (correctMatch === false ? "bg-green-600 text-white hover:bg-green-600" : "bg-red-500 text-white hover:bg-red-500"),
                    )}
                    onClick={() => handleAnswer(false)}
                    disabled={answered !== null}
                >
                    <X className="mr-2 h-6 w-6" /> Falsch
                </Button>
                <Button
                    variant="outline"
                    className={cn(
                        "h-20 text-xl border-green-200 hover:bg-green-50 hover:text-green-600",
                        answered !== null && answered === true && (correctMatch === true ? "bg-green-600 text-white hover:bg-green-600" : "bg-red-500 text-white hover:bg-red-500"),
                    )}
                    onClick={() => handleAnswer(true)}
                    disabled={answered !== null}
                >
                    <Check className="mr-2 h-6 w-6" /> Stimmt
                </Button>
            </div>
            {answered !== null && (
                <div className={cn(
                    "text-center font-medium animate-in fade-in",
                    answered === correctMatch ? "text-green-600" : "text-red-600"
                )}>
                    {answered === correctMatch ? "Richtig! ✓" : `Falsch! Es war ${correctMatch ? "Stimmt" : "Falsch"}`}
                </div>
            )}
        </div>
    );
}

// ── Mini: Typing ─────────────────────────────────────────────────────────────

function MiniTyping({ word, onResult }: { word: Word; onResult: (correct: boolean) => void }) {
    const [input, setInput] = useState("");
    const [checked, setChecked] = useState<boolean | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const handleCheck = () => {
        const correct = input.trim().toLowerCase() === word.secondary.toLowerCase();
        setChecked(correct);
        onResult(correct);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl text-muted-foreground">Schreibe die Übersetzung</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-2 pb-6">
                    <h2 className="text-4xl font-bold text-primary">{word.primary}</h2>
                    {word.primaryInfo && <p className="text-muted-foreground mt-2 text-sm">{word.primaryInfo}</p>}
                </CardContent>
            </Card>
            <div className="space-y-3">
                <div className="relative">
                    <Input
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !checked && input.trim()) handleCheck(); }}
                        placeholder="Übersetzung eingeben…"
                        className="h-14 text-lg text-center"
                        disabled={checked !== null}
                        autoComplete="off"
                    />
                    {checked !== null && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            {checked ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <XCircle className="h-6 w-6 text-red-500" />}
                        </div>
                    )}
                </div>
                {checked === false && (
                    <div className="p-3 bg-destructive/10 text-destructive rounded-md text-center">
                        <p className="font-semibold text-sm">Richtige Antwort:</p>
                        <p className="text-xl font-bold">{word.secondary}</p>
                    </div>
                )}
                {checked === null && (
                    <Button className="w-full h-12" onClick={handleCheck} disabled={!input.trim()}>
                        Überprüfen
                    </Button>
                )}
            </div>
        </div>
    );
}

// ── Mini: Flashcard ──────────────────────────────────────────────────────────

function MiniFlashcard({ word, onResult }: { word: Word; onResult: (correct: boolean) => void }) {
    const [revealed, setRevealed] = useState(false);
    const [answered, setAnswered] = useState(false);

    return (
        <div className="space-y-6">
            <Card className="text-center min-h-48 flex flex-col justify-center cursor-pointer" onClick={() => !revealed && setRevealed(true)}>
                <CardContent className="py-8 space-y-4">
                    <h2 className="text-4xl font-bold">{word.primary}</h2>
                    {word.primaryInfo && <p className="text-muted-foreground text-sm">{word.primaryInfo}</p>}
                    <AnimatePresence>
                        {revealed ? (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="pt-4 border-t"
                            >
                                <p className="text-3xl font-bold text-primary">{word.secondary}</p>
                                {word.secondaryInfo && <p className="text-muted-foreground text-sm mt-1">{word.secondaryInfo}</p>}
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                                <Eye className="h-4 w-4" /> Tippen zum Aufdecken
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
            {revealed && !answered && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                    <Button variant="destructive" className="flex-1 h-14 text-base" onClick={() => { setAnswered(true); onResult(false); }}>
                        <X className="mr-2 h-4 w-4" /> Noch nicht
                    </Button>
                    <Button className="flex-1 h-14 text-base bg-green-600 hover:bg-green-700 text-white" onClick={() => { setAnswered(true); onResult(true); }}>
                        <Check className="mr-2 h-4 w-4" /> Gewusst
                    </Button>
                </motion.div>
            )}
        </div>
    );
}

// ── Main Mixed Game ──────────────────────────────────────────────────────────

export function MixedGame() {
    const { selectedWords, currentWordIndex, nextWord, recordResult } = usePracticeSession();
    const endGame = useEndGame();

    const [sequence] = useState<MiniType[]>(() =>
        selectedWords.map(() => pickMiniType(selectedWords))
    );
    const [waiting, setWaiting] = useState(false);
    const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
    const [key, setKey] = useState(0);

    const currentWord = selectedWords[currentWordIndex];
    const currentMini = sequence[currentWordIndex];

    const handleResult = (correct: boolean) => {
        recordResult(currentWord.id, correct);
        setLastCorrect(correct);
        setWaiting(true);
    };

    const handleAdvance = () => {
        setWaiting(false);
        setLastCorrect(null);
        setKey(k => k + 1);
        if (currentWordIndex < selectedWords.length - 1) {
            nextWord();
        } else {
            endGame();
        }
    };

    if (!currentWord) return null;

    return (
        <div className="max-w-md mx-auto space-y-6">
            {/* Progress + mode badge */}
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                    {currentWordIndex + 1} / {selectedWords.length}
                </span>
                <Badge className={cn("text-xs font-medium", MINI_COLORS[currentMini])}>
                    <Shuffle className="h-3 w-3 mr-1" />
                    {MINI_LABELS[currentMini]}
                </Badge>
            </div>

            {/* Mini game — key forces remount on word change */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={key}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                >
                    {!waiting && currentMini === 'multiple-choice' && (
                        <MiniMultipleChoice word={currentWord} allWords={selectedWords} onResult={handleResult} />
                    )}
                    {!waiting && currentMini === 'true-false' && (
                        <MiniTrueFalse word={currentWord} allWords={selectedWords} onResult={handleResult} />
                    )}
                    {!waiting && currentMini === 'typing' && (
                        <MiniTyping word={currentWord} onResult={handleResult} />
                    )}
                    {!waiting && currentMini === 'flashcard' && (
                        <MiniFlashcard word={currentWord} onResult={handleResult} />
                    )}

                    {/* Next button — appears after answering (except flashcard which has its own) */}
                    {waiting && (
                        <div className="space-y-4 py-4">
                            <p className={cn("text-xl font-bold text-center", lastCorrect ? "text-green-600" : "text-red-500")}>
                                {lastCorrect ? "Richtig! ✓" : "Falsch ✗"}
                            </p>
                            {!lastCorrect && currentMini !== 'flashcard' && (
                                <div className="p-4 bg-destructive/10 text-destructive rounded-md text-center">
                                    <p className="text-sm font-semibold">Richtige Antwort:</p>
                                    <p className="text-xl font-bold mt-1">{currentWord.secondary}</p>
                                    {currentWord.secondaryInfo && (
                                        <p className="text-sm mt-1 opacity-80">{currentWord.secondaryInfo}</p>
                                    )}
                                </div>
                            )}
                            <Button size="lg" onClick={handleAdvance} className="w-full">
                                {currentWordIndex < selectedWords.length - 1 ? "Weiter →" : "Ergebnis anzeigen"}
                            </Button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
