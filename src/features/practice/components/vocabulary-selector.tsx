"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ChevronRightIcon, ChevronLeftIcon, FolderIcon, ClockIcon, CheckIcon, Loader2, XIcon } from "lucide-react"
import { usePracticeSession } from "../hooks/use-practice-session"
import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import type { Word } from "@/generated/prisma/client"
import { VocabularyEntityItem } from "@/components/entity-components"
import { useLanguage, useNativeLanguage } from "@/features/user/hooks/use-language"

type SelectedWords = Map<string, Word>

export function VocabularySelector() {
    const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null)
    const [selectedWords, setSelectedWords] = useState<SelectedWords>(new Map())

    const { setWords } = usePracticeSession()
    const trpc = useTRPC()
    const { currentLanguage } = useLanguage()
    const { data: nativeLanguage } = useNativeLanguage()

    const { data: categories, isLoading: loadingCategories } = useQuery(
        trpc.categories.getCategories.queryOptions({ parentId: currentCategoryId })
    )
    const { data: categoryPath } = useQuery(
        trpc.categories.getCategoryPath.queryOptions({ id: currentCategoryId })
    )
    const { data: words, isLoading: loadingWords } = useQuery(
        trpc.words.getAll.queryOptions({ categoryId: currentCategoryId })
    )
    const { data: dueWords } = useQuery(
        trpc.practice.getDueWords.queryOptions({ limit: 100 })
    )

    const isLoading = loadingCategories || loadingWords

    const toggleWord = (word: Word) => {
        setSelectedWords(prev => {
            const next = new Map(prev)
            if (next.has(word.id)) next.delete(word.id)
            else next.set(word.id, word)
            return next
        })
    }

    const toggleAllInCurrentFolder = () => {
        if (!words?.length) return
        const allSelected = words.every(w => selectedWords.has(w.id))
        setSelectedWords(prev => {
            const next = new Map(prev)
            if (allSelected) words.forEach(w => next.delete(w.id))
            else words.forEach(w => next.set(w.id, w as Word))
            return next
        })
    }

    const selectedCountInFolder = (folderId: string) =>
        [...selectedWords.values()].filter(w => w.categoryId === folderId).length

    const allInFolderSelected = !!(words?.length && words.every(w => selectedWords.has(w.id)))
    const someInFolderSelected = !!(words?.length && words.some(w => selectedWords.has(w.id)) && !allInFolderSelected)

    const handleBack = () => {
        if (!categoryPath || categoryPath.length <= 1) {
            setCurrentCategoryId(null)
        } else {
            setCurrentCategoryId(categoryPath[categoryPath.length - 2].id)
        }
    }

    const confirm = () => setWords([...selectedWords.values()])

    return (
        <div className="flex flex-col gap-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Select Vocabulary</h2>
                <p className="text-muted-foreground text-sm mt-1">Choose the words you want to practice</p>
            </div>

            {/* Due-words quick-start */}
            {dueWords && dueWords.length > 0 && (
                <button
                    onClick={() => setWords(dueWords)}
                    className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-800/50 dark:bg-orange-900/10 p-4 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors text-left"
                >
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full shrink-0">
                        <ClockIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">Start Review Session</p>
                        <p className="text-xs text-muted-foreground">
                            {dueWords.length} word{dueWords.length !== 1 ? "s" : ""} due for review
                        </p>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
            )}

            {/* Browser card */}
            <div className="rounded-xl border bg-card overflow-hidden">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1 px-4 py-2.5 border-b bg-muted/40 text-sm overflow-x-auto whitespace-nowrap">
                    <button
                        onClick={() => setCurrentCategoryId(null)}
                        className={cn(
                            "shrink-0 transition-colors hover:text-foreground",
                            currentCategoryId === null ? "font-semibold text-foreground" : "text-muted-foreground"
                        )}
                    >
                        All folders
                    </button>
                    {categoryPath?.map(cat => (
                        <span key={cat.id} className="flex items-center gap-1 shrink-0">
                            <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <button
                                onClick={() => setCurrentCategoryId(cat.id)}
                                className={cn(
                                    "transition-colors hover:text-foreground",
                                    currentCategoryId === cat.id ? "font-semibold text-foreground" : "text-muted-foreground"
                                )}
                            >
                                {cat.name}
                            </button>
                        </span>
                    ))}
                </div>

                <div className="overflow-y-auto max-h-[420px]">
                    {/* Back button */}
                    {currentCategoryId && (
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 w-full px-4 py-3 hover:bg-accent transition-colors border-b text-sm text-muted-foreground"
                        >
                            <ChevronLeftIcon className="h-4 w-4" />
                            Back
                        </button>
                    )}

                    {/* Select-all row for current folder */}
                    {!isLoading && words && words.length > 0 && (
                        <button
                            onClick={toggleAllInCurrentFolder}
                            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-accent transition-colors border-b text-sm"
                        >
                            <div className={cn(
                                "h-[18px] w-[18px] rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                                allInFolderSelected
                                    ? "bg-primary border-primary"
                                    : someInFolderSelected
                                        ? "bg-primary/30 border-primary"
                                        : "border-border"
                            )}>
                                {allInFolderSelected && <CheckIcon className="h-3 w-3 text-primary-foreground" />}
                                {someInFolderSelected && <div className="h-[6px] w-[6px] bg-primary rounded-sm" />}
                            </div>
                            <span className="font-medium flex-1 text-left">
                                {allInFolderSelected ? "Deselect all in this folder (not inside children folders)" : "Select all in this folder"}
                            </span>
                            <span className="text-muted-foreground tabular-nums">
                                {words.filter(w => selectedWords.has(w.id)).length}&thinsp;/&thinsp;{words.length}
                            </span>
                        </button>
                    )}

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
                        </div>
                    )}

                    {/* Subcategories */}
                    {!isLoading && categories?.map((cat, i) => {
                        const selCount = selectedCountInFolder(cat.id)
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setCurrentCategoryId(cat.id)}
                                className={cn(
                                    "flex items-center gap-3 w-full px-4 py-3 hover:bg-accent transition-colors text-left text-sm",
                                    i < categories.length - 1 && "border-b"
                                )}
                            >
                                <FolderIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="flex-1 font-medium">{cat.name}</span>
                                {selCount > 0 && (
                                    <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full shrink-0">
                                        {selCount} selected
                                    </span>
                                )}
                                <ChevronRightIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                            </button>
                        )
                    })}

                    {/* Separator between folders and words */}
                    {!isLoading && !!categories?.length && !!words?.length && <Separator />}

                    {/* Words */}
                    {!isLoading && words?.map((word, i) => {
                        const isSelected = selectedWords.has(word.id)
                        return (
                            <button
                                key={word.id}
                                onClick={() => toggleWord(word as Word)}
                                className={cn(
                                    "flex items-center gap-3 w-full px-4 py-3 hover:bg-accent transition-colors text-left text-sm",
                                    i < words.length - 1 && "border-b",
                                    isSelected && "bg-primary/5 hover:bg-primary/10"
                                )}
                            >
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => toggleWord(word as Word)}
                                    onClick={e => e.stopPropagation()}
                                    className="shrink-0"
                                />
                                <span className="font-medium flex-1 min-w-0 truncate">{word.primary}</span>
                                <span className="text-muted-foreground truncate max-w-[40%]">{word.secondary}</span>
                            </button>
                        )
                    })}

                    {/* Empty state */}
                    {!isLoading && !categories?.length && !words?.length && (
                        <div className="py-12 text-center text-sm text-muted-foreground">
                            No vocabulary in this folder
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom action bar */}
            <div className="flex items-center justify-between">
                {selectedWords.size > 0 ? (
                    <button
                        onClick={() => setSelectedWords(new Map())}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Clear selection
                    </button>
                ) : (
                    <span className="text-sm text-muted-foreground">No words selected yet</span>
                )}
                <Button
                    onClick={confirm}
                    disabled={selectedWords.size === 0}
                    size="lg"
                >
                    {selectedWords.size > 0
                        ? `Practice ${selectedWords.size} word${selectedWords.size !== 1 ? "s" : ""} →`
                        : "Select words to continue"
                    }
                </Button>
            </div>

            {/* Selected words preview */}
            {selectedWords.size > 0 && (
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                        {selectedWords.size} word{selectedWords.size !== 1 ? "s" : ""} selected
                    </p>
                    <div className="grid xl:grid-cols-2 gap-3">
                        {[...selectedWords.values()].map(word => (
                            <VocabularyEntityItem
                                key={word.id}
                                primaryLanguage={word.primary}
                                primaryInfo={word.primaryInfo}
                                secondaryLanguage={word.secondary}
                                secondaryInfo={word.secondaryInfo}
                                primaryFlag={<span className="text-2xl">{nativeLanguage?.flagEmoji}</span>}
                                secondaryFlag={<span className="text-2xl">{currentLanguage?.flagEmoji}</span>}
                                actions={
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                        onClick={() => toggleWord(word)}
                                    >
                                        <XIcon className="h-3.5 w-3.5" />
                                    </Button>
                                }
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
