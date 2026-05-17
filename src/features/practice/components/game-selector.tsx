"use client"

import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Direction, GameType, usePracticeSession} from "../hooks/use-practice-session";
import {CheckSquare, Grid, Keyboard, Layers, Puzzle, Shuffle, Check, HelpCircle, Zap, ArrowLeftRight, Dices} from "lucide-react";
import {cn} from "@/lib/utils";
import {useTranslations} from "next-intl";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";

const MIN_WORDS: Partial<Record<GameType, number>> = {
    'multiple-choice': 2,
    'reverse-choice': 2,
    'true-false': 2,
    'listening': 2,
    'matching': 2,
    'memory': 2,
};

const GAME_ICONS: Record<GameType, React.ElementType> = {
    mixed: Dices,
    flashcards: Layers,
    'multiple-choice': CheckSquare,
    typing: Keyboard,
    matching: Puzzle,
    memory: Grid,
    scramble: Shuffle,
    'true-false': Check,
    hangman: HelpCircle,
    listening: Zap,
    'reverse-choice': ArrowLeftRight,
}

const GAME_TYPES: GameType[] = [
    'mixed', 'flashcards', 'multiple-choice', 'typing', 'matching',
    'memory', 'scramble', 'true-false', 'hangman', 'listening', 'reverse-choice'
]

export function GameSelector() {
    const { setGameType, startGame, selectedWords, direction, setDirection } = usePracticeSession();
    const t = useTranslations('practice.games');

    const handleSelectGame = (type: GameType) => {
        const min = MIN_WORDS[type] ?? 1;
        if (selectedWords.length < min) return;
        setGameType(type);
        startGame();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground shrink-0">Abfragerichtung:</span>
                <ToggleGroup
                    type="single"
                    variant="outline"
                    value={direction}
                    onValueChange={(val) => { if (val) setDirection(val as Direction); }}
                >
                    <ToggleGroupItem value="forward">Wort → Übersetzung</ToggleGroupItem>
                    <ToggleGroupItem value="reverse">Übersetzung → Wort</ToggleGroupItem>
                    <ToggleGroupItem value="random">Zufällig</ToggleGroupItem>
                </ToggleGroup>
            </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAME_TYPES.map((gameType) => {
                const min = MIN_WORDS[gameType] ?? 1;
                const isDisabled = selectedWords.length < min;
                const isHighlight = gameType === 'mixed';
                const Icon = GAME_ICONS[gameType];
                const titleKey = `${gameType}.title` as Parameters<typeof t>[0];
                const descKey = `${gameType}.description` as Parameters<typeof t>[0];
                return (
                    <Card
                        key={gameType}
                        className={cn(
                            "transition-colors",
                            isDisabled
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer hover:border-primary",
                            isHighlight && !isDisabled && "border-primary/50 bg-primary/5"
                        )}
                        onClick={() => handleSelectGame(gameType)}
                    >
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Icon className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">{t(titleKey)}</CardTitle>
                                {isHighlight && !isDisabled && (
                                    <Badge className="ml-auto text-xs bg-primary/20 text-primary hover:bg-primary/20">
                                        {t('mixed.badge')}
                                    </Badge>
                                )}
                                {isDisabled && (
                                    <Badge variant="secondary" className="ml-auto text-xs">
                                        {t('minWords', { min })}
                                    </Badge>
                                )}
                            </div>
                            <CardDescription>{t(descKey)}</CardDescription>
                        </CardHeader>
                    </Card>
                );
            })}
        </div>
        </div>
    );
}
