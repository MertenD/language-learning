import { get, set } from 'idb-keyval'

const QUEUE_KEY = 'offline-practice-queue'

export type QueuedSession = {
  id: string
  gameType: string
  wordResults: { wordId: string; correct: boolean }[]
  totalScore: number
  durationSeconds: number
  queuedAt: number
}

export async function enqueueSession(
  session: Omit<QueuedSession, 'id' | 'queuedAt'>,
): Promise<void> {
  const queue = await getPendingQueue()
  queue.push({ ...session, id: crypto.randomUUID(), queuedAt: Date.now() })
  await set(QUEUE_KEY, queue)
}

export async function getPendingQueue(): Promise<QueuedSession[]> {
  return (await get<QueuedSession[]>(QUEUE_KEY)) ?? []
}

export async function removeFromQueue(id: string): Promise<void> {
  const queue = await getPendingQueue()
  await set(QUEUE_KEY, queue.filter((s) => s.id !== id))
}
