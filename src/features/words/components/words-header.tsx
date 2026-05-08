"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
    ArrowDownAZIcon, ArrowUpAZIcon, Download, FolderPlusIcon,
    MoreHorizontal, Plus, SparklesIcon, Upload,
} from "lucide-react"
import { WordCreateDialog } from "@/features/words/components/word-create-dialog"
import { CategoryCreateDialog } from "@/features/words/components/categories/category-create-dialog"
import { GenerateWordsDialog } from "@/features/words/components/generate-words-dialog"
import { useWordsParams } from "@/features/words/hooks/use-words-params"
import { useCreateWord, useExportWords, useImportWords, useWordStats } from "@/features/words/hooks/use-words"
import { useCreateCategory } from "@/features/words/hooks/use-categories"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { SORT_BY_OPTIONS } from "@/features/words/params"
import type { CreateWordInput } from "@/features/words/schema/word-crud-schema"

type WordsHeaderProps = {
    disabled?: boolean
}

export default function WordsHeader({ disabled }: WordsHeaderProps) {
    const createWord = useCreateWord()
    const createCategory = useCreateCategory()
    const importWords = useImportWords()
    const exportWords = useExportWords()
    const { data: stats } = useWordStats()

    const { handleError, modal } = useUpgradeModal()
    const [isWordOpen, setIsWordOpen] = useState(false)
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const [isGenerateOpen, setIsGenerateOpen] = useState(false)
    const [params, setParams] = useWordsParams()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleCreateWord = (newWord: CreateWordInput) => {
        createWord.mutate(newWord, {
            onSuccess: () => setIsWordOpen(false),
            onError: handleError,
        })
    }

    const handleCreateCategory = (name: string) => {
        createCategory.mutate(
            { name, parentId: params.categoryId === "" ? undefined : params.categoryId },
            { onSuccess: () => setIsCategoryOpen(false), onError: handleError }
        )
    }

    const handleExport = async () => {
        const toastId = toast.loading("Exporting...")
        exportWords.mutate({ categoryId: params.categoryId }, {
            onSuccess: (csv) => {
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
                const url = URL.createObjectURL(blob)
                const link = document.createElement("a")
                link.href = url
                link.setAttribute("download", "vocabulary.csv")
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                toast.dismiss(toastId)
                toast.success("Exported vocabulary")
            },
            onError: (error) => { toast.dismiss(toastId); handleError(error) },
        })
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = async (e) => {
            const text = e.target?.result
            if (typeof text !== "string") return
            const toastId = toast.loading("Importing...")
            importWords.mutate({ csv: text, categoryId: params.categoryId }, {
                onSuccess: () => toast.dismiss(toastId),
                onError: (error) => { toast.dismiss(toastId); handleError(error) },
            })
        }
        reader.readAsText(file)
        event.target.value = ""
    }

    const SORT_LABELS: Record<string, string> = {
        updatedAt: "Last Updated",
        createdAt: "Date Added",
        primary: "Primary (A–Z)",
        secondary: "Secondary (A–Z)",
    }

    return (
        <>
            <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            {modal}

            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Vocabulary</h1>
                    {stats && (
                        <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                            <span>{stats.total} words</span>
                            {stats.learning > 0 && (
                                <>
                                    <span className="text-border">·</span>
                                    <span className="text-amber-600 dark:text-amber-400">{stats.learning} learning</span>
                                </>
                            )}
                            {stats.mastered > 0 && (
                                <>
                                    <span className="text-border">·</span>
                                    <span className="text-green-600 dark:text-green-400">{stats.mastered} mastered</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Sort */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" disabled={disabled}>
                                {params.sortOrder === "asc"
                                    ? <ArrowUpAZIcon className="mr-1.5 h-4 w-4" />
                                    : <ArrowDownAZIcon className="mr-1.5 h-4 w-4" />
                                }
                                {SORT_LABELS[params.sortBy] ?? "Sort"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {SORT_BY_OPTIONS.map((option) => (
                                <DropdownMenuItem
                                    key={option}
                                    onClick={() => setParams({ sortBy: option, page: 1 })}
                                    className={params.sortBy === option ? "font-medium" : ""}
                                >
                                    {SORT_LABELS[option]}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setParams({ sortOrder: params.sortOrder === "asc" ? "desc" : "asc" })}>
                                {params.sortOrder === "asc" ? "↓ Descending" : "↑ Ascending"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* New Folder — always visible */}
                    <Button variant="outline" size="sm" onClick={() => setIsCategoryOpen(true)} disabled={disabled}>
                        <FolderPlusIcon className="mr-1.5 h-4 w-4" />
                        New Folder
                    </Button>

                    {/* More actions */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" disabled={disabled}>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsGenerateOpen(true)}>
                                <SparklesIcon className="mr-2 h-4 w-4" />
                                Generate with AI
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mr-2 h-4 w-4" />
                                Import CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Primary CTA */}
                    <Button onClick={() => setIsWordOpen(true)} disabled={disabled}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Word
                    </Button>
                </div>
            </div>

            <WordCreateDialog open={isWordOpen} onOpenChange={setIsWordOpen} onCreate={handleCreateWord} categoryId={params.categoryId} />
            <CategoryCreateDialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen} onCreate={handleCreateCategory} />
            <GenerateWordsDialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen} categoryId={params.categoryId || null} />
        </>
    )
}
