import {Card, CardHeader, CardTitle} from "@/components/ui/card";
import {Folder, MoreVertical, PencilIcon, Trash} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useWordsParams} from "@/features/words/hooks/use-words-params";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {WordCategory} from "@/generated/prisma/client";
import {useRemoveCategory, useUpdateCategory} from "@/features/words/hooks/use-categories";
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
import {Input} from "@/components/ui/input";
import React, {useState} from "react";

type CategoryItemProps = {
    category: WordCategory
}

export default function CategoryItem({ category }: CategoryItemProps) {
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

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsConfirmOpen(true)
    }

    const confirmRemove = () => {
        removeCategory.mutate({ id: category.id })
    }

    const handleRenameStart = (e: React.MouseEvent) => {
        e.stopPropagation()
        setEditName(category.name)
        setIsEditing(true)
    }

    const handleRenameSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const trimmed = editName.trim()
        if (trimmed && trimmed !== category.name) {
            updateCategory.mutate({ id: category.id, name: trimmed })
        }
        setIsEditing(false)
    }

    const handleRenameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsEditing(false)
            setEditName(category.name)
        }
    }

    return (
        <>
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={handleClick}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 flex-1 min-w-0">
                        <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                        {isEditing ? (
                            <form onSubmit={handleRenameSubmit} onClick={e => e.stopPropagation()} className="flex-1">
                                <Input
                                    autoFocus
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    onBlur={handleRenameSubmit}
                                    onKeyDown={handleRenameKeyDown}
                                    className="h-6 px-1 py-0 text-sm"
                                />
                            </form>
                        ) : (
                            <span className="truncate">{category.name}</span>
                        )}
                    </CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleRenameStart}>
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleRemove} className="text-destructive">
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
            </Card>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete category?</AlertDialogTitle>
                        <AlertDialogDescription>
                            "{category.name}" will be permanently deleted. Words inside will not be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRemove}
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
