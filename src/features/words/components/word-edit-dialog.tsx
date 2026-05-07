"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {Word} from "@/generated/prisma/client";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreateWordInput, createWordSchema } from "@/features/words/schema/word-crud-schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSuspenseAllCategories } from "@/features/words/hooks/use-categories"
import { useLanguage, useNativeLanguage } from "@/features/user/hooks/use-language"
import { PlusIcon, Trash2Icon } from "lucide-react"

interface WordEditDialogProps {
    word: Word
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave?: (word: Word) => void | Promise<void>
}

export function WordEditDialog({ word, open, onOpenChange, onSave }: WordEditDialogProps) {
    const [isEditing, setIsEditing] = useState(false)
    const categories = useSuspenseAllCategories()
    const { currentLanguage } = useLanguage()
    const { data: nativeLanguage } = useNativeLanguage()

    const form = useForm<CreateWordInput>({
        resolver: zodResolver(createWordSchema),
        defaultValues: {
            primary: word.primary,
            primaryInfo: word.primaryInfo || "",
            secondary: word.secondary,
            secondaryInfo: word.secondaryInfo || "",
            categoryId: word.categoryId || undefined,
            examples: word.examples ?? []
        }
    })

    useEffect(() => {
        if (isEditing) {
            form.reset({
                primary: word.primary,
                primaryInfo: word.primaryInfo || "",
                secondary: word.secondary,
                secondaryInfo: word.secondaryInfo || "",
                categoryId: word.categoryId || undefined,
                examples: word.examples ?? []
            })
        }
    }, [isEditing, word, form])

    // Reset edit mode when dialog closes
    useEffect(() => {
        if (!open) setIsEditing(false)
    }, [open])

    const onSubmit = async (data: CreateWordInput) => {
        if (onSave) {
            const updatedWord: Word = {
                ...word,
                ...data,
                primaryInfo: data.primaryInfo || null,
                secondaryInfo: data.secondaryInfo || null,
                categoryId: data.categoryId === "root" ? null : (data.categoryId || null),
                examples: data.examples?.filter(e => e.trim().length > 0) ?? []
            }
            await onSave(updatedWord)
        }
        setIsEditing(false)
    }

    const handleCancel = () => {
        setIsEditing(false)
        form.reset()
    }

    const examples = form.watch("examples") ?? []

    const addExample = () => {
        form.setValue("examples", [...examples, ""])
    }

    const removeExample = (index: number) => {
        form.setValue("examples", examples.filter((_, i) => i !== index))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Vocabulary Details</DialogTitle>
                    <DialogDescription>View and edit vocabulary.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {isEditing ? (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="primary"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <span className="text-2xl">{nativeLanguage?.flagEmoji}</span>
                                                {nativeLanguage?.name ?? "Primary"}
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="primaryInfo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Additional info (optional)" {...field} value={field.value || ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="secondary"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <span className="text-2xl">{currentLanguage?.flagEmoji}</span>
                                                {currentLanguage?.name ?? "Secondary"}
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="secondaryInfo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Additional info (optional)" {...field} value={field.value || ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || undefined} value={field.value || undefined}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="root">No Category</SelectItem>
                                                    {categories.data.map((category) => (
                                                        <SelectItem key={category.id} value={category.id}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <FormLabel>Examples</FormLabel>
                                    {examples.map((_, index) => (
                                        <FormField
                                            key={index}
                                            control={form.control}
                                            name={`examples.${index}`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex gap-2">
                                                        <FormControl>
                                                            <Input placeholder="Example sentence" {...field} />
                                                        </FormControl>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeExample(index)}
                                                        >
                                                            <Trash2Icon className="size-4" />
                                                        </Button>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={addExample} className="w-full">
                                        <PlusIcon className="size-4 mr-2" />
                                        Add Example
                                    </Button>
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <Button type="button" variant="outline" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Save</Button>
                                </div>
                            </form>
                        </Form>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-3xl">{nativeLanguage?.flagEmoji}</span>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold">{word.primary}</h3>
                                        {word.primaryInfo && <p className="text-sm text-muted-foreground mt-1">{word.primaryInfo}</p>}
                                    </div>
                                </div>

                                <div className="flex items-center justify-center text-2xl text-muted-foreground">↕</div>

                                <div className="flex items-start gap-3">
                                    <span className="text-3xl">{currentLanguage?.flagEmoji}</span>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold">{word.secondary}</h3>
                                        {word.secondaryInfo && <p className="text-sm text-muted-foreground mt-1">{word.secondaryInfo}</p>}
                                    </div>
                                </div>

                                {word.examples && word.examples.length > 0 && (
                                    <div className="space-y-1 pt-2">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Examples</p>
                                        <ul className="space-y-1">
                                            {word.examples.map((ex, i) => (
                                                <li key={i} className="text-sm text-muted-foreground border-l-2 border-border pl-3">{ex}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {word.categoryId && (
                                    <div className="text-sm text-muted-foreground">
                                        Category: {categories.data.find(c => c.id === word.categoryId)?.name || "Unknown"}
                                    </div>
                                )}
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
