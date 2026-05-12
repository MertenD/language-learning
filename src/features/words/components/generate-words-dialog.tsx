"use client"

import { useState } from "react"
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, SparklesIcon, RotateCcwIcon, CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGenerateWords, useBulkCreateWords } from "@/features/words/hooks/use-words"
import { useLanguage, useNativeLanguage } from "@/features/user/hooks/use-language"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"
import { WordType, WORD_TYPE_LABELS, WORD_TYPE_COLORS, wordTypeSchema } from "@/features/words/schema/word-crud-schema"

type GeneratedWord = {
    primary: string
    secondary: string
    primaryInfo?: string
    secondaryInfo?: string
    examples?: string[]
    wordType?: WordType
    forms?: Record<string, string>
}

const ALL_WORD_TYPES = Object.keys(WORD_TYPE_LABELS) as WordType[]

const COUNT_OPTIONS = [5, 10, 15, 20]

interface GenerateWordsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    categoryId?: string | null
}

export function GenerateWordsDialog({ open, onOpenChange, categoryId }: GenerateWordsDialogProps) {
    const [topic, setTopic] = useState("")
    const [count, setCount] = useState(10)
    const [selectedTypes, setSelectedTypes] = useState<Set<WordType>>(new Set(ALL_WORD_TYPES))
    const [generatedWords, setGeneratedWords] = useState<GeneratedWord[]>([])
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
    const [lastTopic, setLastTopic] = useState("")

    const generateWords = useGenerateWords()
    const bulkCreate = useBulkCreateWords()
    const { currentLanguage } = useLanguage()
    const { data: nativeLanguage } = useNativeLanguage()
    const { handleError, modal } = useUpgradeModal()

    const isInputPhase = generatedWords.length === 0
    const isLoading = generateWords.isPending
    const isSaving = bulkCreate.isPending

    const toggleType = (type: WordType) => {
        setSelectedTypes(prev => {
            if (prev.size === 1 && prev.has(type)) return prev // keep at least one
            const next = new Set(prev)
            if (next.has(type)) next.delete(type)
            else next.add(type)
            return next
        })
    }

    const handleGenerate = () => {
        if (!topic.trim()) return
        generateWords.mutate({
            topic: topic.trim(),
            count,
            wordTypes: Array.from(selectedTypes),
        }, {
            onSuccess: (words) => {
                setGeneratedWords(words as GeneratedWord[])
                setSelectedIndices(new Set(words.map((_, i) => i)))
                setLastTopic(topic.trim())
            },
            onError: handleError,
        })
    }

    const toggleWord = (index: number) => {
        setSelectedIndices(prev => {
            const next = new Set(prev)
            if (next.has(index)) next.delete(index)
            else next.add(index)
            return next
        })
    }

    const toggleAll = () => {
        if (selectedIndices.size === generatedWords.length) {
            setSelectedIndices(new Set())
        } else {
            setSelectedIndices(new Set(generatedWords.map((_, i) => i)))
        }
    }

    const handleSave = () => {
        const wordsToSave = generatedWords
            .filter((_, i) => selectedIndices.has(i))
            .map(w => ({
                primary: w.primary,
                secondary: w.secondary,
                primaryInfo: w.primaryInfo,
                secondaryInfo: w.secondaryInfo,
                examples: w.examples,
                categoryId: categoryId ?? null,
                wordType: w.wordType,
                forms: w.forms,
            }))

        bulkCreate.mutate({ words: wordsToSave }, {
            onSuccess: () => {
                onOpenChange(false)
                setGeneratedWords([])
                setSelectedIndices(new Set())
                setTopic("")
            },
        })
    }

    const handleRegenerate = () => {
        setGeneratedWords([])
        setSelectedIndices(new Set())
    }

    const handleClose = (open: boolean) => {
        if (!open) {
            setGeneratedWords([])
            setSelectedIndices(new Set())
            setTopic("")
        }
        onOpenChange(open)
    }

    const canGenerate = topic.trim().length > 0 && selectedTypes.size > 0

    return (
        <>
            {modal}
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[580px] max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <SparklesIcon className="h-5 w-5 text-primary" />
                            Generate Vocabulary
                        </DialogTitle>
                        <DialogDescription>
                            {isInputPhase
                                ? "Enter a topic and let AI generate vocabulary for you."
                                : `${generatedWords.length} words generated for "${lastTopic}". Select the ones you want to save.`
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {isInputPhase ? (
                        /* ── Step 1: Topic input ── */
                        <div className="space-y-5 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="topic">Topic</Label>
                                <Input
                                    id="topic"
                                    placeholder="e.g. Cooking, Travel, Technology, Sports…"
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter" && topic.trim()) handleGenerate() }}
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Number of words</Label>
                                <div className="flex gap-2">
                                    {COUNT_OPTIONS.map(n => (
                                        <button
                                            key={n}
                                            type="button"
                                            onClick={() => setCount(n)}
                                            className={cn(
                                                "flex-1 rounded-md border py-1.5 text-sm font-medium transition-colors",
                                                count === n
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-border hover:bg-accent"
                                            )}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Word types</Label>
                                <div className="flex flex-wrap gap-2">
                                    {ALL_WORD_TYPES.map(type => {
                                        const checked = selectedTypes.has(type)
                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => toggleType(type)}
                                                className={cn(
                                                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                                                    checked
                                                        ? WORD_TYPE_COLORS[type]
                                                        : "border-border text-muted-foreground hover:bg-accent"
                                                )}
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    className="h-3 w-3 pointer-events-none"
                                                />
                                                {WORD_TYPE_LABELS[type]}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <Button
                                className="w-full"
                                onClick={handleGenerate}
                                disabled={!canGenerate || isLoading}
                            >
                                {isLoading
                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</>
                                    : <><SparklesIcon className="mr-2 h-4 w-4" /> Generate {count} words</>
                                }
                            </Button>
                        </div>
                    ) : (
                        /* ── Step 2: Word selection ── */
                        <div className="flex flex-col gap-3 min-h-0">
                            <div className="flex items-center justify-between text-sm">
                                <button
                                    type="button"
                                    onClick={toggleAll}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {selectedIndices.size === generatedWords.length ? "Deselect all" : "Select all"}
                                </button>
                                <span className="text-muted-foreground">
                                    {selectedIndices.size} / {generatedWords.length} selected
                                </span>
                            </div>

                            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                                {generatedWords.map((word, i) => {
                                    const isSelected = selectedIndices.has(i)
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => toggleWord(i)}
                                            className={cn(
                                                "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors select-none",
                                                isSelected
                                                    ? "border-primary/50 bg-primary/5"
                                                    : "border-border hover:bg-accent/50 opacity-60"
                                            )}
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleWord(i)}
                                                onClick={e => e.stopPropagation()}
                                                className="mt-0.5 flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    {word.wordType && (
                                                        <span className={cn(
                                                            "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0",
                                                            WORD_TYPE_COLORS[word.wordType] ?? ""
                                                        )}>
                                                            {WORD_TYPE_LABELS[word.wordType] ?? word.wordType}
                                                        </span>
                                                    )}
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <span className="text-lg">{nativeLanguage?.flagEmoji}</span>
                                                        <div>
                                                            <span className="font-medium text-sm">{word.primary}</span>
                                                            {word.primaryInfo && (
                                                                <span className="text-xs text-muted-foreground ml-1.5">{word.primaryInfo}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="text-muted-foreground text-xs flex-shrink-0">→</span>
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <span className="text-lg">{currentLanguage?.flagEmoji}</span>
                                                        <div>
                                                            <span className="font-medium text-sm">{word.secondary}</span>
                                                            {word.secondaryInfo && (
                                                                <span className="text-xs text-muted-foreground ml-1.5">{word.secondaryInfo}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {word.examples && word.examples.length > 0 && (
                                                    <p className="text-xs text-muted-foreground border-l-2 border-border pl-2 italic">
                                                        {word.examples[0]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex gap-2 pt-1 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRegenerate}
                                    disabled={isSaving}
                                >
                                    <RotateCcwIcon className="mr-2 h-3.5 w-3.5" />
                                    Regenerate
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleSave}
                                    disabled={selectedIndices.size === 0 || isSaving}
                                >
                                    {isSaving
                                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                                        : <><CheckIcon className="mr-2 h-4 w-4" /> Save {selectedIndices.size} word{selectedIndices.size !== 1 ? "s" : ""}</>
                                    }
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
