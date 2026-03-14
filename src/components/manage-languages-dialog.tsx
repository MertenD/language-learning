"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { useLanguage } from "@/features/user/hooks/use-language"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ComboboxLanguage } from "./combobox-language"
import { useState } from "react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";

interface ManageLanguagesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ManageLanguagesDialog({ open, onOpenChange }: ManageLanguagesDialogProps) {
    const { availableLanguages: userLanguages, currentLanguage } = useLanguage()
    const trpc = useTRPC()
    const queryClient = useQueryClient()
    const { refetch: refetchSession } = authClient.useSession()

    const { data: allLanguages } = useQuery(trpc.user.getAvailableLanguages.queryOptions())

    const [addingLanguage, setAddingLanguage] = useState<string | null>(null)

    const addLanguageMutation = useMutation({
        ...trpc.user.addLanguage.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.user.getLanguages.queryOptions().queryKey })
            refetchSession()
            toast.success("Language added successfully")
            setAddingLanguage(null)
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const removeLanguageMutation = useMutation({
        ...trpc.user.removeLanguage.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.user.getLanguages.queryOptions().queryKey })
            // If current language was removed, the backend switches it.
            // The frontend useLanguage effect should pick up the change after invalidation.
            refetchSession()
            toast.success("Language removed successfully")
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })


    const languagesToAdd = allLanguages?.filter(l => !userLanguages.find(ul => ul.id === l.id)) || []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Manage Languages</DialogTitle>
                    <DialogDescription>
                        Add new languages to learn or remove existing ones.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium">Your Languages</h4>
                        <div className="flex flex-col gap-2">
                            {userLanguages.map(language => (
                                <div key={language.id} className="flex items-center justify-between p-2 border rounded-md">
                                    <span className="flex items-center gap-2">
                                        <span className="text-xl">{language.flagEmoji}</span>
                                        <span className="font-medium text-sm">{language.name}</span>
                                        {language.id === currentLanguage?.id && (
                                            <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">Current</span>
                                        )}
                                    </span>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={userLanguages.length <= 1 || removeLanguageMutation.isPending}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete your progress for {language.name}. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    onClick={() => removeLanguageMutation.mutate({ languageId: language.id })}
                                                >
                                                    {removeLanguageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="text-sm font-medium">Add Language</h4>
                        <div className="flex gap-2">
                             <div className="flex-1">
                                 <ComboboxLanguage
                                    languages={languagesToAdd}
                                    value={addingLanguage || ""}
                                    onChange={setAddingLanguage}
                                    placeholder="Select a language to add..."
                                 />
                             </div>
                             <Button
                                onClick={() => {
                                    if (addingLanguage) {
                                        addLanguageMutation.mutate({ languageId: addingLanguage })
                                    }
                                }}
                                disabled={!addingLanguage || addLanguageMutation.isPending}
                             >
                                {addLanguageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                             </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
