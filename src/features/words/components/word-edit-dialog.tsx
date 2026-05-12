"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {Word, WordProgress} from "@/generated/prisma/client";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreateWordInput, createWordSchema, WORD_TYPE_LABELS, WORD_TYPE_COLORS, WordType } from "@/features/words/schema/word-crud-schema"
import { WordFormsFields } from "@/features/words/components/word-forms-fields"
import { cn } from "@/lib/utils"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSuspenseAllCategories } from "@/features/words/hooks/use-categories"
import { useLanguage, useNativeLanguage } from "@/features/user/hooks/use-language"
import { PlusIcon, Trash2Icon } from "lucide-react"

type WordWithProgress = Word & { progress?: WordProgress | null }

const LEVEL_LABELS = ["New", "Learning", "Learning", "Advanced", "Advanced", "Mastered"]
const LEVEL_COLORS = ["text-muted-foreground", "text-amber-500", "text-amber-600", "text-blue-500", "text-blue-600", "text-green-500"]

type FormsRecord = Record<string, string | undefined | null>

function FormRow({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null
    return (
        <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-xs text-muted-foreground shrink-0 w-24">{label}</span>
            <span className="text-sm font-medium truncate">{value}</span>
        </div>
    )
}

function WordFormsDisplay({ wordType, forms }: { wordType: string; forms: FormsRecord }) {
    const f = forms

    const pronouns = [
        { pronoun: "ich", key: "firstPersonSingular" },
        { pronoun: "du", key: "secondPersonSingular" },
        { pronoun: "er/sie/es", key: "thirdPersonSingular" },
        { pronoun: "wir", key: "firstPersonPlural" },
        { pronoun: "ihr", key: "secondPersonPlural" },
        { pronoun: "sie/Sie", key: "thirdPersonPlural" },
    ]
    const hasConjugation = pronouns.some(p => f[p.key])

    return (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2">
                <span className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full",
                    WORD_TYPE_COLORS[wordType as WordType] ?? "bg-gray-100 text-gray-500"
                )}>
                    {WORD_TYPE_LABELS[wordType as WordType] ?? wordType}
                </span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {wordType === "noun" && "Grammatik"}
                    {wordType === "verb" && "Konjugation"}
                    {wordType === "adjective" && "Steigerung"}
                </span>
            </div>

            {wordType === "noun" && (
                <div className="space-y-1.5">
                    <FormRow label="Geschlecht" value={f.gender} />
                    <FormRow label="Plural" value={f.plural} />
                </div>
            )}

            {wordType === "verb" && (
                <div className="space-y-3">
                    {hasConjugation && (
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                            {pronouns.map(({ pronoun, key }) =>
                                f[key] ? (
                                    <div key={key} className="flex items-baseline gap-2">
                                        <span className="text-xs text-muted-foreground w-16 shrink-0">{pronoun}</span>
                                        <span className="text-sm font-medium">{f[key]}</span>
                                    </div>
                                ) : null
                            )}
                        </div>
                    )}
                    {(f.pastTense || f.pastParticiple || f.auxiliary) && (
                        <div className="space-y-1.5 pt-1 border-t border-border/50">
                            <FormRow label="Vergangenheit" value={f.pastTense} />
                            <FormRow label="Partizip II" value={f.pastParticiple} />
                            <FormRow label="Hilfsverb" value={f.auxiliary} />
                        </div>
                    )}
                </div>
            )}

            {wordType === "adjective" && (
                <div className="space-y-1.5">
                    <FormRow label="Komparativ" value={f.comparative} />
                    <FormRow label="Superlativ" value={f.superlative} />
                    <FormRow label="Feminin" value={f.feminineForm} />
                </div>
            )}
        </div>
    )
}

interface WordEditDialogProps {
    word: WordWithProgress
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
            examples: word.examples ?? [],
            wordType: (word.wordType as WordType) || undefined,
            forms: (word.forms as Record<string, string>) || {},
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
                examples: word.examples ?? [],
                wordType: (word.wordType as WordType) || undefined,
                forms: (word.forms as Record<string, string>) || {},
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
                examples: data.examples?.filter(e => e.trim().length > 0) ?? [],
                wordType: data.wordType || null,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                forms: (data.forms && Object.values(data.forms).some(Boolean) ? data.forms : null) as any,
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
    const wordType = form.watch("wordType") as WordType | undefined

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
                                    name="wordType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Word Type</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type (optional)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {(Object.keys(WORD_TYPE_LABELS) as WordType[]).map(type => (
                                                        <SelectItem key={type} value={type}>{WORD_TYPE_LABELS[type]}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <WordFormsFields control={form.control} wordType={wordType} languageCode={currentLanguage?.code} />

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

                                {word.wordType && word.wordType !== "phrase" && word.wordType !== "other" && word.forms && (
                                    <WordFormsDisplay
                                        wordType={word.wordType}
                                        forms={word.forms as FormsRecord}
                                    />
                                )}

                                {word.wordType && (word.wordType === "phrase" || word.wordType === "other") && (
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-xs font-semibold px-2 py-0.5 rounded-full",
                                            WORD_TYPE_COLORS[word.wordType as WordType] ?? ""
                                        )}>
                                            {WORD_TYPE_LABELS[word.wordType as WordType] ?? word.wordType}
                                        </span>
                                    </div>
                                )}

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

                            {word.progress && (
                                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Practice Stats</p>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-muted-foreground text-xs">Level</p>
                                            <p className={`font-semibold ${LEVEL_COLORS[word.progress.level] ?? ""}`}>
                                                {LEVEL_LABELS[word.progress.level] ?? "Unknown"} ({word.progress.level}/5)
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Repetitions</p>
                                            <p className="font-semibold">{word.progress.repititions}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Correct</p>
                                            <p className="font-semibold text-green-600">{word.progress.totalCorrect}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Incorrect</p>
                                            <p className="font-semibold text-red-500">{word.progress.totalIncorrect}</p>
                                        </div>
                                        {word.progress.nextReviewAt && (
                                            <div className="col-span-2">
                                                <p className="text-muted-foreground text-xs">Next Review</p>
                                                <p className="font-semibold">{word.progress.nextReviewAt.toLocaleDateString("de-DE")}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

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
