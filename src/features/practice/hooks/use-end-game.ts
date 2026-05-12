"use client";

import { useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { usePracticeSession } from "./use-practice-session";
import { authClient } from "@/lib/auth-client";
import { enqueueSession } from "@/lib/offline-queue";
import { toast } from "sonner";

export function useEndGame() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  const { endGame, wordResults, gameType, score, gameStartedAt } =
    usePracticeSession();

  const completeSession = useMutation(
    trpc.practice.completeSession.mutationOptions({
      onSuccess: () => {
        const languageId = session?.user?.currentLanguageId;
        if (languageId) {
          queryClient.invalidateQueries(
            trpc.user.getLanguageStats.queryOptions({ languageId }),
          );
          queryClient.invalidateQueries(
            trpc.user.getRecentActivities.queryOptions({ languageId }),
          );
        }
        queryClient.invalidateQueries(trpc.words.getMany.queryOptions({}));
        queryClient.invalidateQueries(trpc.user.getWordProgressStats.queryOptions());
        queryClient.invalidateQueries(trpc.practice.getDueWords.queryOptions({ limit: 100 }));
        queryClient.invalidateQueries(trpc.practice.getDueWordCount.queryOptions());
      },
      onError: async (_error, variables) => {
        if (!navigator.onLine) {
          await enqueueSession(variables);
          toast.info('Offline — Ergebnis wird synchronisiert, sobald du online bist');
        }
      },
    }),
  );

  // Keep a ref with the latest values so the returned callback never goes stale.
  // Game components call endGame() inside setTimeout closures; without this ref
  // the closure would capture an old snapshot of wordResults (missing the last answer).
  const latestRef = useRef({
    endGame,
    wordResults,
    gameType,
    score,
    gameStartedAt,
    completeSession,
  });
  latestRef.current = { endGame, wordResults, gameType, score, gameStartedAt, completeSession };

  return useCallback(() => {
    const { endGame, wordResults, gameType, score, gameStartedAt, completeSession } =
      latestRef.current;

    const durationSeconds = gameStartedAt
      ? Math.round((Date.now() - gameStartedAt.getTime()) / 1000)
      : 0;

    endGame();

    if (gameType) {
      completeSession.mutate({
        gameType,
        wordResults,
        totalScore: score,
        durationSeconds,
      });
    }
  }, []); // stable reference — reads latest values from ref at call time
}
