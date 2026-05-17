import { create } from 'zustand';
import {Word} from "@/generated/prisma/client";

export type GameType =
    | 'flashcards'
    | 'multiple-choice'
    | 'typing'
    | 'matching'
    | 'memory'
    | 'scramble'
    | 'true-false'
    | 'hangman'
    | 'listening'
    | 'reverse-choice'
    | 'mixed';

export type WordResult = { wordId: string; correct: boolean };

export type Direction = 'forward' | 'reverse' | 'random';

export type SessionResult = {
    xpEarned: number;
    xpBefore: number;
    xpAfter: number;
    levelBefore: number;
    levelAfter: number;
    leveledUp: boolean;
    wordUpdates: Array<{
        wordId: string;
        levelBefore: number | null;
        levelAfter: number;
        correct: boolean;
    }>;
};

interface PracticeState {
    selectedWords: Word[];
    gameType: GameType | null;
    direction: Direction;
    score: number;
    currentWordIndex: number;
    isGameActive: boolean;
    isGameFinished: boolean;
    wordResults: WordResult[];
    gameStartedAt: Date | null;
    sessionResult: SessionResult | null;

    setWords: (words: Word[]) => void;
    setGameType: (type: GameType | null) => void;
    setDirection: (direction: Direction) => void;
    startGame: () => void;
    endGame: () => void;
    recordResult: (wordId: string, correct: boolean) => void;
    incrementScore: () => void;
    nextWord: () => void;
    resetSession: () => void;
    setSessionResult: (result: SessionResult) => void;
}

export const usePracticeSession = create<PracticeState>((set) => ({
    selectedWords: [],
    gameType: null,
    direction: 'forward',
    score: 0,
    currentWordIndex: 0,
    isGameActive: false,
    isGameFinished: false,
    wordResults: [],
    gameStartedAt: null,
    sessionResult: null,

    setWords: (words) => set({ selectedWords: words }),
    setGameType: (type) => set({ gameType: type }),
    setDirection: (direction) => set({ direction }),
    startGame: () => set((state) => {
        const shuffled = [...state.selectedWords].sort(() => Math.random() - 0.5);
        const flip = (w: Word): Word => ({
            ...w,
            primary: w.secondary,
            primaryInfo: w.secondaryInfo ?? null,
            secondary: w.primary,
            secondaryInfo: w.primaryInfo ?? null,
        });
        let directedWords: Word[];
        if (state.direction === 'reverse') {
            directedWords = shuffled.map(flip);
        } else if (state.direction === 'random') {
            directedWords = shuffled.map(w => Math.random() > 0.5 ? flip(w) : w);
        } else {
            directedWords = shuffled;
        }
        return {
            isGameActive: true,
            isGameFinished: false,
            score: 0,
            currentWordIndex: 0,
            wordResults: [],
            gameStartedAt: new Date(),
            sessionResult: null,
            selectedWords: directedWords,
        };
    }),
    endGame: () => set({ isGameActive: false, isGameFinished: true }),
    recordResult: (wordId, correct) => set((state) => ({
        wordResults: [...state.wordResults, { wordId, correct }],
        score: correct ? state.score + 1 : state.score,
    })),
    incrementScore: () => set((state) => ({ score: state.score + 1 })),
    nextWord: () => set((state) => ({ currentWordIndex: state.currentWordIndex + 1 })),
    resetSession: () => set({
        selectedWords: [],
        gameType: null,
        score: 0,
        currentWordIndex: 0,
        isGameActive: false,
        isGameFinished: false,
        wordResults: [],
        gameStartedAt: null,
        sessionResult: null,
    }),
    setSessionResult: (result) => set({ sessionResult: result }),
}));
