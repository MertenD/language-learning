"use client"

import {useUpgradeModal} from "@/hooks/use-upgrade-modal";
import {WordCreateDialog} from "@/features/words/components/word-create-dialog";
import {useState} from "react";
import {CreateWordInput} from "@/features/words/schema/word-crud-schema";
import {Button} from "@/components/ui/button";
import {Download, MoreHorizontal, Plus, Upload} from "lucide-react";
import {CategoryCreateDialog} from "@/features/words/components/categories/category-create-dialog";
import {useWordsParams} from "@/features/words/hooks/use-words-params";
import {useCreateWord, useExportWords, useImportWords} from "@/features/words/hooks/use-words";
import {useCreateCategory} from "@/features/words/hooks/use-categories";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {useRef} from "react";
import {toast} from "sonner";

type WordsHeaderProps = {
    disabled?: boolean
}

export default function WordsHeader({ disabled }: WordsHeaderProps) {
    const createWord = useCreateWord()
    const createCategory = useCreateCategory()
    const importWords = useImportWords()
    const exportWords = useExportWords()

    const { handleError, modal } = useUpgradeModal()
    const [isWordOpen, setIsWordOpen] = useState(false)
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const [params] = useWordsParams()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleCreateWord = (newWord: CreateWordInput) => {
        createWord.mutate(newWord, {
            onSuccess: () => {
                setIsWordOpen(false)
            },
            onError: (error) => {
                handleError(error)
            }
        })
    }

    const handleCreateCategory = (name: string) => {
        createCategory.mutate({
            name,
            parentId: params.categoryId === "" ? undefined : params.categoryId
        }, {
            onSuccess: () => {
                setIsCategoryOpen(false)
            },
            onError: (error) => {
                handleError(error)
            }
        })
    }

    const handleExport = async () => {
        const toastId = toast.loading("Exporting...")

        exportWords.mutate({
            categoryId: params.categoryId
        }, {
            onSuccess: (csv) => {
                const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'})
                const url = URL.createObjectURL(blob)
                const link = document.createElement("a")
                link.href = url
                link.setAttribute("download", "vocabulary.csv")
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                toast.dismiss(toastId)
                toast.success("Successfully exported vocabulary")
            },
            onError: (error) => {
                toast.dismiss(toastId)
                handleError(error)
            }
        })
    }

    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (e) => {
            const text = e.target?.result
            if (typeof text !== "string") return

            const toastId = toast.loading("Importing...")

            importWords.mutate({
                csv: text,
                categoryId: params.categoryId
            }, {
                onSuccess: () => {
                    toast.dismiss(toastId)
                    // Success toast is handled in hook
                },
                onError: (error) => {
                    toast.dismiss(toastId)
                    handleError(error)
                }
            })
        }
        reader.readAsText(file)

        event.target.value = ""
    }

    return <>
        <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
        />
        {modal}
        <div className="flex items-center justify-between mb-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Vocabulary</h1>
                <p className="text-muted-foreground">Create and manage your vocabulary</p>
            </div>
            <div className="flex gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" disabled={disabled}>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleImportClick}>
                            <Upload className="mr-2 h-4 w-4" />
                            Import CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={() => setIsCategoryOpen(true)} variant="outline" disabled={disabled}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Folder
                </Button>
                <Button onClick={() => setIsWordOpen(true)} disabled={disabled}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Vocabulary
                </Button>
            </div>
        </div>
        <WordCreateDialog open={isWordOpen} onOpenChange={setIsWordOpen} onCreate={handleCreateWord} categoryId={params.categoryId} />
        <CategoryCreateDialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen} onCreate={handleCreateCategory} />
    </>
}