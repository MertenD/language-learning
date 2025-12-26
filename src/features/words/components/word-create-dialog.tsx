"use client"

// TODO Der Dialog soll ein Form sein, genau wie bei login und sign up, damit ich direkt gegen das Schema validieren kann und dem Benutzer passende Fehlermeldungen in den Eingabefeldern anzeigen kann; nicht erst nach abschicken der Request

import {useState} from "react"
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {CreateWordInput} from "@/features/words/schema/word-crud-schema";

interface WordCreateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreate: (newWord: CreateWordInput) => void | Promise<void>
    categoryId?: string
}

export function WordCreateDialog({ open, onOpenChange, onCreate, categoryId }: WordCreateDialogProps) {
    const emptyWord: CreateWordInput = {
        german: "",
        germanInfo: undefined,
        serbian: "",
        serbianInfo: undefined,
        categoryId: !categoryId || categoryId === "" ? undefined : categoryId
    }
    const [newWord, setNewWord] = useState<CreateWordInput>(emptyWord)

    function handleCreate() {
        onCreate(newWord)
        setNewWord(emptyWord)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Vocabulary Details</DialogTitle>
                    <DialogDescription>Create new vocabulary.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <span className="text-2xl">🇩🇪</span> German
                            </label>
                            <input
                                type="text"
                                value={newWord.german}
                                onChange={(e) => setNewWord({ ...newWord, german: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                            <input
                                type="text"
                                value={newWord.germanInfo || ""}
                                onChange={(e) => setNewWord({
                                    ...newWord,
                                    germanInfo: e.target.value === "" ? undefined : e.target.value
                                })}
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
                                value={newWord.serbian}
                                onChange={(e) => setNewWord({ ...newWord, serbian: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                            <input
                                type="text"
                                value={newWord.serbianInfo || ""}
                                onChange={(e) => setNewWord({
                                    ...newWord,
                                    serbianInfo: e.target.value === "" ? undefined : e.target.value
                                })}
                                placeholder="Additional info (optional)"
                                className="w-full px-3 py-2 border rounded-md text-sm"
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate}>Create</Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
