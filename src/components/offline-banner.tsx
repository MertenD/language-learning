'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { getPendingQueue, removeFromQueue } from '@/lib/offline-queue';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const syncingRef = useRef(false);

  const completeSession = useMutation(
    trpc.practice.completeSession.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.words.getMany.queryOptions({}));
        queryClient.invalidateQueries(trpc.practice.getDueWordCount.queryOptions());
      },
    }),
  );

  async function syncQueue() {
    if (syncingRef.current) return;
    syncingRef.current = true;
    try {
      const queue = await getPendingQueue();
      if (queue.length === 0) return;
      setPendingCount(queue.length);
      for (const session of queue) {
        try {
          await completeSession.mutateAsync({
            gameType: session.gameType,
            wordResults: session.wordResults,
            totalScore: session.totalScore,
            durationSeconds: session.durationSeconds,
          });
          await removeFromQueue(session.id);
          setPendingCount((n) => Math.max(0, n - 1));
        } catch {
          // Network still unavailable — stop trying
          break;
        }
      }
    } finally {
      syncingRef.current = false;
    }
  }

  useEffect(() => {
    setIsOnline(navigator.onLine);
    getPendingQueue().then((q) => setPendingCount(q.length));

    const handleOnline = () => {
      setIsOnline(true);
      syncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine) syncQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-lg md:left-auto md:right-4 md:w-auto">
      <WifiOff className="h-4 w-4 shrink-0" />
      {!isOnline
        ? 'Offline — Übungsergebnisse werden lokal gespeichert'
        : `${pendingCount} Ergebnis${pendingCount !== 1 ? 'se' : ''} wird synchronisiert…`}
    </div>
  );
}
