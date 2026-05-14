"use client"

import {useTRPC} from "@/trpc/client";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {ComboboxLanguage} from "@/components/combobox-language";
import {PlusIcon, Trash2Icon} from "lucide-react";
import {useState} from "react";
import {useLanguage} from "@/features/user/hooks/use-language";

export default function LanguagesTab() {
    const trpc = useTRPC()
    const queryClient = useQueryClient()
    const { currentLanguage } = useLanguage()
    const [addLanguageId, setAddLanguageId] = useState("")
    const [nativeLanguageId, setNativeLanguageId] = useState("")

    const { data: languages } = useQuery(trpc.user.getLanguages.queryOptions())
    const { data: availableLanguages } = useQuery(trpc.user.getAvailableLanguages.queryOptions())
    const { data: nativeLanguage } = useQuery(trpc.user.getNativeLanguage.queryOptions())

    const addLanguageMutation = useMutation(trpc.user.addLanguage.mutationOptions({
        onSuccess: () => {
            toast.success("Language added")
            setAddLanguageId("")
            queryClient.invalidateQueries(trpc.user.getLanguages.queryOptions())
        },
        onError: (err) => toast.error(err.message)
    }))

    const removeLanguageMutation = useMutation(trpc.user.removeLanguage.mutationOptions({
        onSuccess: () => {
            toast.success("Language removed")
            queryClient.invalidateQueries(trpc.user.getLanguages.queryOptions())
        },
        onError: (err) => toast.error(err.message)
    }))

    const updateNativeMutation = useMutation(trpc.user.updateNativeLanguage.mutationOptions({
        onSuccess: () => {
            toast.success("Native language updated")
            queryClient.invalidateQueries(trpc.user.getNativeLanguage.queryOptions())
        },
        onError: (err) => toast.error(err.message)
    }))

    const alreadyAdded = new Set(languages?.map(l => l.id) ?? [])
    const addableLanguages = availableLanguages?.filter(l => !alreadyAdded.has(l.id)) ?? []

    return (
        <div className="mt-4 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Learning Languages</CardTitle>
                    <CardDescription>Manage the languages you are currently learning.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {languages?.map(lang => (
                            <div key={lang.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{lang.flagEmoji}</span>
                                    <span className="text-sm font-medium">{lang.name}</span>
                                    {currentLanguage?.id === lang.id && (
                                        <Badge variant="secondary" className="text-xs">Current</Badge>
                                    )}
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            disabled={removeLanguageMutation.isPending}
                                        >
                                            <Trash2Icon className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Remove {lang.name}?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will remove all progress for {lang.name}. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                onClick={() => removeLanguageMutation.mutate({ languageId: lang.id })}
                                            >
                                                Remove
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                    </div>

                    {addableLanguages.length > 0 && (
                        <div className="flex gap-2">
                            <ComboboxLanguage
                                languages={addableLanguages}
                                value={addLanguageId}
                                onChange={setAddLanguageId}
                                placeholder="Add a language…"
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                disabled={!addLanguageId || addLanguageMutation.isPending}
                                onClick={() => addLanguageMutation.mutate({ languageId: addLanguageId })}
                            >
                                <PlusIcon className="h-4 w-4" />
                                Add
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>Native Language</CardTitle>
                    <CardDescription>The language you speak natively. Used to tailor translations and explanations.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                    <ComboboxLanguage
                        languages={availableLanguages ?? []}
                        value={nativeLanguageId || nativeLanguage?.id || ""}
                        onChange={setNativeLanguageId}
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        disabled={!nativeLanguageId || nativeLanguageId === nativeLanguage?.id || updateNativeMutation.isPending}
                        onClick={() => updateNativeMutation.mutate({ languageId: nativeLanguageId })}
                    >
                        {updateNativeMutation.isPending ? "Saving…" : "Save"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
