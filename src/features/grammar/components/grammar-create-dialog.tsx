"use client"

// TODO Der Dialog soll ein Form sein, genau wie bei login und sign up, damit ich direkt gegen das Schema validieren kann und dem Benutzer passende Fehlermeldungen in den Eingabefeldern anzeigen kann; nicht erst nach abschicken der Request
// TODO Vllt kann ich das dann ja mithilfe eines übergebenen Forms abstrahieren, dass ich auch ein entity dialog hinbekomme

import {useState} from "react"
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {CreateGrammarInput} from "@/features/grammar/schema/grammar-crud-schema";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";

interface GrammarCreateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreate: (newGrammar: CreateGrammarInput) => void | Promise<void>
}

export function GrammarCreateDialog({ open, onOpenChange, onCreate }: GrammarCreateDialogProps) {
    const emptyGrammar: CreateGrammarInput = {
        title: "",
        content: ""
    }
    const [newGrammar, setNewGrammar] = useState<CreateGrammarInput>(emptyGrammar)

    function handleCreate() {
        onCreate(newGrammar)
        setNewGrammar(emptyGrammar)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Grammar Details</DialogTitle>
                    <DialogDescription>Create new Grammar.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                Title
                            </label>
                            <Input
                                type="text"
                                value={newGrammar.title}
                                onChange={(e) => setNewGrammar({...newGrammar, title: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                            <label className="text-sm font-medium flex items-center gap-2">
                                Grammar Rule
                            </label>
                            <Textarea
                                value={newGrammar.content}
                                cols={10}
                                onChange={(e) => setNewGrammar({...newGrammar, content: e.target.value})}
                                className="w-full h-[200px] px-3 py-2 border rounded-md"
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
