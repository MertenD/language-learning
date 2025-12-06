"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {Word} from "@/generated/prisma/client";

interface WordEditDialogProps {
    word: Word
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave?: (word: Word) => void | Promise<void>
}

export function WordEditDialog({ word, open, onOpenChange, onSave }: WordEditDialogProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedWord, setEditedWord] = useState(word)

    const handleSave = async () => {
        if (onSave) {
            await onSave(editedWord)
        }
        setIsEditing(false)
    }

    const handleCancel = () => {
        setEditedWord(word)
        setIsEditing(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Vocabulary Details</DialogTitle>
                    <DialogDescription>View and edit vocabulary.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <span className="text-2xl">🇩🇪</span> German
                                </label>
                                <input
                                    type="text"
                                    value={editedWord.german}
                                    onChange={(e) => setEditedWord({ ...editedWord, german: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                                <input
                                    type="text"
                                    value={editedWord.germanInfo || ""}
                                    onChange={(e) => setEditedWord({ ...editedWord, germanInfo: e.target.value })}
                                    placeholder="Additional info (optional)"
                                    className="w-full px-3 py-2 border rounded-md text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <span className="text-2xl">🇷🇸</span> Serbian
                                </label>
                                <input
                                    type="text"
                                    value={editedWord.serbian}
                                    onChange={(e) => setEditedWord({ ...editedWord, serbian: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                                <input
                                    type="text"
                                    value={editedWord.serbianInfo || ""}
                                    onChange={(e) => setEditedWord({ ...editedWord, serbianInfo: e.target.value })}
                                    placeholder="Additional info (optional)"
                                    className="w-full px-3 py-2 border rounded-md text-sm"
                                />
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={editedWord === word}>Save</Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-3xl">🇩🇪</span>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold">{word.german}</h3>
                                        {word.germanInfo && <p className="text-sm text-muted-foreground mt-1">{word.germanInfo}</p>}
                                    </div>
                                </div>

                                <div className="flex items-center justify-center text-2xl text-muted-foreground">↕</div>

                                <div className="flex items-start gap-3">
                                    <span className="text-3xl">🇷🇸</span>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold">{word.serbian}</h3>
                                        {word.serbianInfo && <p className="text-sm text-muted-foreground mt-1">{word.serbianInfo}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                                <span>Created: {word.createdAt.toLocaleDateString("de-DE")}</span>
                                {word.updatedAt.getTime() !== word.createdAt.getTime() && (
                                    <span>Updated: {word.updatedAt.toLocaleDateString("de-DE")}</span>
                                )}
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setIsEditing(true)}>
                                    Edit
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
