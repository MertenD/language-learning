"use client"

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RotateCcw, ArrowLeft, Star, TrendingUp, TrendingDown, Minus, ArrowRight, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePracticeSession } from "../hooks/use-practice-session";
import { cn } from "@/lib/utils";
import { LEVEL_CHIP_CLASSES, LevelChip } from "@/features/words/components/word-item";
import {useTranslations} from "next-intl";

function xpStartOfLevel(level: number): number {
    return ((level - 1) * level / 2) * 100;
}

function xpNeededForLevel(level: number): number {
    return level * 100;
}

function XpBar({ xpBefore, xpAfter, levelBefore, levelAfter, xpEarned }: {
    xpBefore: number;
    xpAfter: number;
    levelBefore: number;
    levelAfter: number;
    xpEarned: number;
}) {
    const displayLevel = levelAfter;
    const start = xpStartOfLevel(displayLevel);
    const needed = xpNeededForLevel(displayLevel);
    const progressAfter = Math.min((xpAfter - start) / needed, 1);

    const progressBefore = levelBefore === levelAfter
        ? Math.min((xpBefore - xpStartOfLevel(levelBefore)) / xpNeededForLevel(levelBefore), 1)
        : 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-base">Level {displayLevel}</span>
                <span className="text-muted-foreground">
                    {xpAfter - start} / {needed} XP
                </span>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                    className="absolute inset-y-0 left-0 bg-primary rounded-full"
                    initial={{ width: `${progressBefore * 100}%` }}
                    animate={{ width: `${progressAfter * 100}%` }}
                    transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                />
            </div>
            <div className="flex justify-end">
                <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-0.5 text-sm font-semibold"
                >
                    +{xpEarned} XP
                </motion.span>
            </div>
        </div>
    );
}

function NewWordBadge() {
    const t = useTranslations('practice.summary');
    return (
        <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap",
            LEVEL_CHIP_CLASSES[0]
        )}>
            {t('wordNew')}
        </span>
    );
}

export function SessionSummary() {
    const { selectedWords, gameType, score, sessionResult, setGameType, resetSession } = usePracticeSession();
    const router = useRouter();
    const t = useTranslations('practice.summary');
    const tGames = useTranslations('practice.games');

    const totalWords = selectedWords.length;
    const percentage = totalWords > 0 ? Math.round((score / totalWords) * 100) : 0;

    if (!sessionResult) {
        return (
            <div className="max-w-md mx-auto text-center py-24 space-y-4">
                <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
                <p className="text-muted-foreground">{t('savingResult')}</p>
            </div>
        );
    }

    const { xpEarned, xpBefore, xpAfter, levelBefore, levelAfter, leveledUp, wordUpdates } = sessionResult;

    const wordMap = new Map(selectedWords.map(w => [w.id, w]));

    const sortedWordUpdates = [...wordUpdates].sort((a, b) => {
        const scoreA = (a.levelBefore === null ? 1 : 0) + (a.levelAfter > (a.levelBefore ?? -1) ? 2 : 0) - (a.levelAfter < (a.levelBefore ?? 0) ? 1 : 0);
        const scoreB = (b.levelBefore === null ? 1 : 0) + (b.levelAfter > (b.levelBefore ?? -1) ? 2 : 0) - (b.levelAfter < (b.levelBefore ?? 0) ? 1 : 0);
        return scoreB - scoreA;
    });

    const gameLabel = gameType
        ? tGames(`${gameType}.title` as Parameters<typeof tGames>[0])
        : "";

    const container = {
        hidden: {},
        show: { transition: { staggerChildren: 0.08, delayChildren: 0.9 } },
    };
    const item = {
        hidden: { opacity: 0, x: -12 },
        show: { opacity: 1, x: 0, transition: { duration: 0.35 } },
    };

    return (
        <div className="max-w-md mx-auto space-y-6 py-8">
            {/* Header */}
            <div className="text-center space-y-3">
                <motion.div
                    className="flex justify-center"
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                >
                    <div className="bg-primary/10 p-5 rounded-full">
                        <Trophy className="h-14 w-14 text-primary" />
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <h2 className="text-2xl font-bold">{t('sessionComplete')}</h2>
                    <p className="text-muted-foreground text-sm mt-1">{gameLabel}</p>
                </motion.div>
            </div>

            {/* Score */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
            >
                <Card>
                    <CardContent className="pt-5 pb-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">{t('resultLabel')}</p>
                            <p className="text-4xl font-bold text-primary">{score} <span className="text-2xl text-muted-foreground font-normal">/ {totalWords}</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold">{percentage}%</p>
                            <p className="text-xs text-muted-foreground">{t('correctPercent')}</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* XP Bar */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Card>
                    <CardContent className="pt-5 pb-5">
                        <XpBar
                            xpBefore={xpBefore}
                            xpAfter={xpAfter}
                            levelBefore={levelBefore}
                            levelAfter={levelAfter}
                            xpEarned={xpEarned}
                        />
                    </CardContent>
                </Card>
            </motion.div>

            {/* Level-Up Banner */}
            <AnimatePresence>
                {leveledUp && (
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.7 }}
                    >
                        <Card className="border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20">
                            <CardContent className="pt-4 pb-4 flex items-center gap-3">
                                <div className="flex gap-0.5">
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: [0, 1.4, 1] }}
                                            transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                                        >
                                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-400" />
                                        </motion.div>
                                    ))}
                                </div>
                                <div>
                                    <p className="font-bold text-yellow-700 dark:text-yellow-400">{t('levelUp')}</p>
                                    <p className="text-sm text-yellow-600 dark:text-yellow-500">
                                        {t('levelUpDetail', { from: levelBefore, to: levelAfter })}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Word Progress List */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-2"
            >
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
                    {t('wordsThisRound')}
                </p>
                {sortedWordUpdates.map((wu) => {
                    const word = wordMap.get(wu.wordId);
                    const isNew = wu.levelBefore === null;
                    const levelUp = !isNew && wu.levelAfter > wu.levelBefore!;
                    const levelDown = !isNew && wu.levelAfter < wu.levelBefore!;
                    const mastered = wu.levelAfter === 5;

                    return (
                        <motion.div
                            key={wu.wordId}
                            variants={item}
                            className={cn(
                                "flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 border-l-4",
                                mastered && "border-l-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10",
                                !mastered && levelUp && "border-l-green-500",
                                levelDown && "border-l-orange-400",
                                isNew && !mastered && "border-l-blue-400",
                                !isNew && !levelUp && !levelDown && !mastered && "border-l-border",
                            )}
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                    {word?.primary ?? wu.wordId}
                                </p>
                                {word?.secondary && (
                                    <p className="text-xs text-muted-foreground truncate">{word.secondary}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                {isNew ? (
                                    <>
                                        <NewWordBadge />
                                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                        <LevelChip level={wu.levelAfter} />
                                    </>
                                ) : (
                                    <>
                                        <LevelChip level={wu.levelBefore!} />
                                        {levelUp && <TrendingUp className="h-3.5 w-3.5 text-green-600" />}
                                        {levelDown && <TrendingDown className="h-3.5 w-3.5 text-orange-500" />}
                                        {!levelUp && !levelDown && <Minus className="h-3 w-3 text-muted-foreground" />}
                                        <LevelChip level={wu.levelAfter} />
                                    </>
                                )}
                                {mastered && <Star className="h-4 w-4 text-yellow-500 fill-yellow-400 ml-0.5" />}
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Buttons */}
            <motion.div
                className="flex flex-col gap-3 pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 + sortedWordUpdates.length * 0.08 + 0.2 }}
            >
                <Button size="lg" onClick={() => setGameType(null)} className="w-full">
                    <RotateCcw className="mr-2 h-4 w-4" /> {t('playAgain')}
                </Button>
                <Button variant="outline" size="lg" onClick={resetSession} className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" /> {t('chooseOtherWords')}
                </Button>
                <Button variant="ghost" size="lg" onClick={() => router.push("/dashboard")} className="w-full">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> {t('backToDashboard')}
                </Button>
            </motion.div>
        </div>
    );
}
