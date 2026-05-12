"use client"

import { Suspense, useState } from "react"
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FolderIcon, FolderOpenIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSuspenseAllCategories } from "@/features/words/hooks/use-categories"
import { useBulkMoveWords } from "@/features/words/hooks/use-words"

type Category = { id: string; name: string; parentId: string | null }

function buildLabel(cat: Category, allCats: Category[]): string {
    if (!cat.parentId) return cat.name
    const parent = allCats.find(c => c.id === cat.parentId)
    return parent ? `${parent.name} / ${cat.name}` : cat.name
}

type MoveWordsDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    wordIds: string[]
    onSuccess: () => void
}

function CategoryList({ wordIds, onSuccess, onOpenChange }: Omit<MoveWordsDialogProps, "open">) {
    const { data: categories } = useSuspenseAllCategories()
    const bulkMove = useBulkMoveWords()
    const [selected, setSelected] = useState<string | null | undefined>(undefined)
    const isUnselected = selected === undefined

    const sorted = [...categories].sort((a, b) => buildLabel(a, categories).localeCompare(buildLabel(b, categories)))

    const handleMove = () => {
        bulkMove.mutate(
            { ids: wordIds, categoryId: selected ?? null },
            {
                onSuccess: () => {
                    onOpenChange(false)
                    onSuccess()
                },
            }
        )
    }

    return (
        <>
            <ScrollArea className="max-h-72 pr-1">
                <div className="space-y-1 py-1">
                    <button
                        type="button"
                        onClick={() => setSelected(null)}
                        className={cn(
                            "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors text-left",
                            selected === null
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted text-muted-foreground"
                        )}
                    >
                        <FolderOpenIcon className="h-4 w-4 shrink-0" />
                        <span>(Kein Ordner)</span>
                    </button>

                    {sorted.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelected(cat.id)}
                            className={cn(
                                "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors text-left",
                                selected === cat.id
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                            )}
                        >
                            <FolderIcon className="h-4 w-4 shrink-0" />
                            <span>{buildLabel(cat, categories)}</span>
                        </button>
                    ))}
                </div>
            </ScrollArea>

            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Abbrechen
                </Button>
                <Button
                    onClick={handleMove}
                    disabled={isUnselected || bulkMove.isPending}
                >
                    {wordIds.length} Vokabel{wordIds.length !== 1 ? "n" : ""} verschieben
                </Button>
            </DialogFooter>
        </>
    )
}

export default function MoveWordsDialog({ open, onOpenChange, wordIds, onSuccess }: MoveWordsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>In Ordner verschieben</DialogTitle>
                </DialogHeader>
                <Suspense fallback={<div className="h-32 flex items-center justify-center text-sm text-muted-foreground">Laden…</div>}>
                    <CategoryList wordIds={wordIds} onSuccess={onSuccess} onOpenChange={onOpenChange} />
                </Suspense>
            </DialogContent>
        </Dialog>
    )
}
