"use client"

import {useState} from "react"
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {CreateWordInput} from "@/features/words/schema/word-crud-schema";

interface WordCreateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreate: (newWord: CreateWordInput) => void | Promise<void>
}

export function WordCreateDialog({ open, onOpenChange, onCreate }: WordCreateDialogProps) {
    const [newWord, setNewWord] = useState<CreateWordInput>({
        german: "",
        germanInfo: undefined,
        serbian: "",
        serbianInfo: undefined
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Vocabulary Details</DialogTitle>
                    <DialogDescription>View and editor vocabulary.</DialogDescription>
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
                            <Button onClick={() => onCreate(newWord)}>Save</Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
