"use client"

import {useState} from "react"
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Grammar} from "@/generated/prisma/client";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";

interface GrammarEditDialogProps {
    grammar: Grammar
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (grammar: Grammar) => void | Promise<void>
}

export function GrammarEditDialog({ grammar, open, onOpenChange, onSave }: GrammarEditDialogProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedGrammar, setEditedGrammar] = useState(grammar)

    const handleSave = async () => {
        onSave(editedGrammar)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setEditedGrammar(grammar)
        setIsEditing(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Grammar Details</DialogTitle>
                    <DialogDescription>View and edit grammar.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    Title
                                </label>
                                <Input
                                    type="text"
                                    value={grammar.title}
                                    onChange={(e) => setEditedGrammar({...grammar, title: e.target.value})}

                                />
                                <label className="text-sm font-medium flex items-center gap-2">
                                    Grammar Rule
                                </label>
                                <Textarea
                                    value={grammar.content}
                                    cols={10}
                                    onChange={(e) => setEditedGrammar({...grammar, content: e.target.value})}
                                />
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={editedGrammar === grammar}>Save</Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">{grammar.title}</h3>
                                <p>{grammar.content}</p>
                            </div>

                            <div
                                className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                                <span>Created: {grammar.createdAt.toLocaleDateString("de-DE")}</span>
                                {grammar.updatedAt.getTime() !== grammar.createdAt.getTime() && (
                                    <span>Updated: {grammar.updatedAt.toLocaleDateString("de-DE")}</span>
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
