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
    | 'reverse-choice';

export type WordResult = { wordId: string; correct: boolean };

interface PracticeState {
    selectedWords: Word[];
    gameType: GameType | null;
    score: number;
    currentWordIndex: number;
    isGameActive: boolean;
    isGameFinished: boolean;
    wordResults: WordResult[];
    gameStartedAt: Date | null;

    setWords: (words: Word[]) => void;
    setGameType: (type: GameType | null) => void;
    startGame: () => void;
    endGame: () => void;
    recordResult: (wordId: string, correct: boolean) => void;
    incrementScore: () => void;
    nextWord: () => void;
    resetSession: () => void;
}

export const usePracticeSession = create<PracticeState>((set) => ({
    selectedWords: [],
    gameType: null,
    score: 0,
    currentWordIndex: 0,
    isGameActive: false,
    isGameFinished: false,
    wordResults: [],
    gameStartedAt: null,

    setWords: (words) => set({ selectedWords: words }),
    setGameType: (type) => set({ gameType: type }),
    startGame: () => set({
        isGameActive: true,
        isGameFinished: false,
        score: 0,
        currentWordIndex: 0,
        wordResults: [],
        gameStartedAt: new Date(),
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
    })
}));
