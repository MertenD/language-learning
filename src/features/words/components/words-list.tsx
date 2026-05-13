"use client"

import { useState } from "react"
import { useSuspenseWords, useBulkDeleteWords } from "@/features/words/hooks/use-words"
import WordsEmpty from "@/features/words/components/words-empty"
import WordItem from "@/features/words/components/word-item"
import CategoryChip from "@/features/words/components/categories/category-chip"
import MoveWordsDialog from "@/features/words/components/move-words-dialog"
import { useWordsParams } from "@/features/words/hooks/use-words-params"
import { useSuspenseCategoriesByParent } from "@/features/words/hooks/use-categories"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { FolderInputIcon, Trash2Icon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {useTranslations} from "next-intl";

export default function WordsList() {
    const [params] = useWordsParams()
    const words = useSuspenseWords()
    const categories = useSuspenseCategoriesByParent(params.categoryId || null)
    const bulkDelete = useBulkDeleteWords()
    const t = useTranslations('words');

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isMoveOpen, setIsMoveOpen] = useState(false)

    const isSelectMode = selectedIds.size > 0

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
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

    const count = selectedIds.size

    return (
        <div className="space-y-4">
            {/* Folder chips */}
            {categories.data.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {categories.data.map(cat => (
                        <CategoryChip key={cat.id} category={cat} />
                    ))}
                </div>
            )}

            {/* Bulk-select bar */}
            {isSelectMode && (
                <div className="flex items-center justify-between rounded-lg border bg-primary/5 border-primary/20 px-4 py-2.5">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearSelection}>
                            <XIcon className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">{t('bulkSelect.selected', { count })}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setSelectedIds(new Set(words.data.items.map(w => w.id)))}
                        >
                            {t('bulkSelect.selectAll', { count: words.data.items.length })}
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsMoveOpen(true)}
                        >
                            <FolderInputIcon className="mr-2 h-4 w-4" />
                            {t('bulkSelect.move', { count })}
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setIsConfirmOpen(true)}
                            disabled={bulkDelete.isPending}
                        >
                            <Trash2Icon className="mr-2 h-4 w-4" />
                            {t('bulkSelect.delete', { count })}
                        </Button>
                    </div>
                </div>
            )}

            {/* Word cards */}
            {words.data.items.length > 0 && (
                <div className="grid md:grid-cols-2 gap-3">
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
                                        onClick={e => e.stopPropagation()}
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
                                    onClick={e => { e.stopPropagation(); toggleSelect(word.id) }}
                                >
                                    <Checkbox className="bg-background border-2" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <MoveWordsDialog
                open={isMoveOpen}
                onOpenChange={setIsMoveOpen}
                wordIds={Array.from(selectedIds)}
                onSuccess={clearSelection}
            />

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteConfirm.title', { count })}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('deleteConfirm.description')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('deleteConfirm.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t('deleteConfirm.confirm', { count })}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
