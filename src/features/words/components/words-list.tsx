"use client"

import { useState } from "react";
import {useSuspenseWords} from "@/features/words/hooks/use-words";
import WordsEmpty from "@/features/words/components/words-empty";
import WordItem from "@/features/words/components/word-item";
import CategoryItem from "@/features/words/components/categories/category-item";
import {useWordsParams} from "@/features/words/hooks/use-words-params";
import {useSuspenseCategoriesByParent} from "@/features/words/hooks/use-categories";
import {useBulkDeleteWords} from "@/features/words/hooks/use-words";
import {Checkbox} from "@/components/ui/checkbox";
import {Button} from "@/components/ui/button";
import {Trash2Icon, XIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function WordsList() {
    const [params] = useWordsParams()
    const words = useSuspenseWords()
    const categories = useSuspenseCategoriesByParent(params.categoryId || null)
    const bulkDelete = useBulkDeleteWords()

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    const isSelectMode = selectedIds.size > 0

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const selectAll = () => {
        setSelectedIds(new Set(words.data.items.map(w => w.id)))
    }

    const clearSelection = () => setSelectedIds(new Set())

    const handleBulkDelete = () => {
        bulkDelete.mutate({ ids: Array.from(selectedIds) }, {
            onSuccess: () => {
                setIsConfirmOpen(false)
                clearSelection()
            }
        })
    }

    if (words.data.items.length === 0 && categories.data.length === 0) {
        return <WordsEmpty />
    }

    return (
        <div className="space-y-4">
            {isSelectMode && (
                <div className="flex items-center justify-between rounded-lg border bg-primary/5 border-primary/20 px-4 py-2.5">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearSelection}>
                            <XIcon className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">{selectedIds.size} selected</span>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAll}>
                            Select all {words.data.items.length}
                        </Button>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setIsConfirmOpen(true)}
                        disabled={bulkDelete.isPending}
                    >
                        <Trash2Icon className="mr-2 h-4 w-4" />
                        Delete {selectedIds.size}
                    </Button>
                </div>
            )}

            <div className="grid xl:grid-cols-2 gap-4">
                {categories.data.map((category) => (
                    <CategoryItem key={category.id} category={category} />
                ))}
                {words.data.items.map((word) => (
                    <div
                        key={word.id}
                        className={cn("relative group", isSelectMode && "cursor-pointer")}
                        onClick={isSelectMode ? () => toggleSelect(word.id) : undefined}
                    >
                        {isSelectMode && (
                            <div className="absolute top-3 left-3 z-10">
                                <Checkbox
                                    checked={selectedIds.has(word.id)}
                                    onCheckedChange={() => toggleSelect(word.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-background border-2"
                                />
                            </div>
                        )}
                        <div className={cn(
                            "transition-all",
                            isSelectMode && selectedIds.has(word.id) && "ring-2 ring-primary rounded-lg",
                            isSelectMode && "pointer-events-none pl-8"
                        )}>
                            <WordItem data={word} />
                        </div>
                        {!isSelectMode && (
                            <div
                                className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => { e.stopPropagation(); toggleSelect(word.id) }}
                            >
                                <Checkbox className="bg-background border-2" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedIds.size} word{selectedIds.size !== 1 ? "s" : ""}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. All selected vocabulary will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete {selectedIds.size} word{selectedIds.size !== 1 ? "s" : ""}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
