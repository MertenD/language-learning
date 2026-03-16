"use client"

import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {GameType, usePracticeSession} from "../hooks/use-practice-session";
import {CheckSquare, Grid, Keyboard, Layers, Puzzle, Shuffle, Check, HelpCircle, Zap, ArrowLeftRight} from "lucide-react";

const GAMES: { type: GameType; title: string; description: string; icon: any }[] = [
    {
        type: 'flashcards',
        title: 'Flashcards',
        description: 'Classic flip cards to test your memory.',
        icon: Layers
    },
    {
        type: 'multiple-choice',
        title: 'Multiple Choice',
        description: 'Select the correct translation from options.',
        icon: CheckSquare
    },
    {
        type: 'typing',
        title: 'Typing Practice',
        description: 'Type the correct translation to improve spelling.',
        icon: Keyboard
    },
    {
        type: 'matching',
        title: 'Matching Pairs',
        description: 'Match primary words with their secondary translations.',
        icon: Puzzle
    },
    {
        type: 'memory',
        title: 'Memory Game',
        description: 'Find matching pairs in a grid of face-down cards.',
        icon: Grid
    },
    {
        type: 'scramble',
        title: 'Word Scramble',
        description: 'Unscramble the letters to form the correct word.',
        icon: Shuffle
    },
    {
        type: 'true-false',
        title: 'True or False',
        description: 'Decide if the translation is correct or not.',
        icon: Check
    },
    {
        type: 'hangman',
        title: 'Hangman',
        description: 'Guess the word letter by letter before you run out of attempts.',
        icon: HelpCircle
    },
    {
        type: 'listening', // Using 'listening' type for Speed Match as per plan adjustment
        title: 'Speed Match',
        description: 'Quickly decide if the word pair matches.',
        icon: Zap
    },
    {
        type: 'reverse-choice',
        title: 'Reverse Choice',
        description: 'Select the primary word for the given secondary translation.',
        icon: ArrowLeftRight
    }
];

export function GameSelector() {
    const { setGameType, startGame } = usePracticeSession();

    const handleSelectGame = (type: GameType) => {
        setGameType(type);
        startGame();
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAMES.map((game) => (
                <Card
                    key={game.type}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleSelectGame(game.type)}
                >
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <game.icon className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{game.title}</CardTitle>
                        </div>
                        <CardDescription>{game.description}</CardDescription>
                    </CardHeader>
                </Card>
            ))}
        </div>
    );
}
