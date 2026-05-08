"use client"

import React, { useState } from "react"
import { FolderIcon, MoreVertical, PencilIcon, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useWordsParams } from "@/features/words/hooks/use-words-params"
import { useRemoveCategory, useUpdateCategory } from "@/features/words/hooks/use-categories"
import type { WordCategory } from "@/generated/prisma/client"

export default function CategoryChip({ category }: { category: WordCategory }) {
    const [_, setParams] = useWordsParams()
    const removeCategory = useRemoveCategory()
    const updateCategory = useUpdateCategory()
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState(category.name)

    const handleClick = () => {
        if (isEditing) return
        setParams({ categoryId: category.id, page: 1 })
    }

    const handleRenameStart = (e: React.MouseEvent) => {
        e.stopPropagation()
        setEditName(category.name)
        setIsEditing(true)
    }

    const handleRenameSubmit = (e?: React.FormEvent) => {
        e?.preventDefault()
        e?.stopPropagation()
        const trimmed = editName.trim()
        if (trimmed && trimmed !== category.name) {
            updateCategory.mutate({ id: category.id, name: trimmed })
        }
        setIsEditing(false)
    }

    return (
        <>
            <div
                onClick={handleClick}
                className="inline-flex items-center gap-1.5 h-8 pl-2.5 pr-1 rounded-full border bg-background hover:bg-accent/60 transition-colors cursor-pointer text-sm font-medium shrink-0"
            >
                <FolderIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                {isEditing ? (
                    <form
                        onSubmit={handleRenameSubmit}
                        onClick={e => e.stopPropagation()}
                    >
                        <Input
                            autoFocus
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onBlur={() => handleRenameSubmit()}
                            onKeyDown={e => { if (e.key === "Escape") { setIsEditing(false); setEditName(category.name) } }}
                            className="h-5 w-24 px-1 py-0 text-sm border-0 focus-visible:ring-0 bg-transparent"
                        />
                    </form>
                ) : (
                    <span className="max-w-[140px] truncate">{category.name}</span>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full hover:bg-accent"
                            onClick={e => e.stopPropagation()}
                        >
                            <MoreVertical className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleRenameStart}>
                            <PencilIcon className="mr-2 h-3.5 w-3.5" />
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={e => { e.stopPropagation(); setIsConfirmOpen(true) }}
                        >
                            <Trash className="mr-2 h-3.5 w-3.5" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete folder?</AlertDialogTitle>
                        <AlertDialogDescription>
                            "{category.name}" will be permanently deleted. Words inside will not be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => removeCategory.mutate({ id: category.id })}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
