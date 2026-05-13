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
import { useTranslations, useFormatter } from "next-intl"
import { LEVEL_CHIP_CLASSES } from "@/features/words/components/word-item"

type WordWithProgress = Word & { progress?: WordProgress | null }

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
    const t = useTranslations('words.editDialog.forms')
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
                    {wordType === "noun" && t('grammarLabel')}
                    {wordType === "verb" && t('conjugationLabel')}
                    {wordType === "adjective" && t('comparisonLabel')}
                </span>
            </div>

            {wordType === "noun" && (
                <div className="space-y-1.5">
                    <FormRow label={t('genderLabel')} value={f.gender} />
                    <FormRow label={t('pluralLabel')} value={f.plural} />
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
                            <FormRow label={t('pastTenseLabel')} value={f.pastTense} />
                            <FormRow label={t('participleLabel')} value={f.pastParticiple} />
                            <FormRow label={t('auxiliaryLabel')} value={f.auxiliary} />
                        </div>
                    )}
                </div>
            )}

            {wordType === "adjective" && (
                <div className="space-y-1.5">
                    <FormRow label={t('comparativeLabel')} value={f.comparative} />
                    <FormRow label={t('superlativeLabel')} value={f.superlative} />
                    <FormRow label={t('feminineLabel')} value={f.feminineForm} />
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
    const t = useTranslations('words.editDialog')
    const tLevels = useTranslations('words.levels')
    const format = useFormatter()

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

    const getLevelLabel = (level: number) => {
        const key = String(level) as Parameters<typeof tLevels>[0]
        return ['0','1','2','3','4','5'].includes(String(level)) ? tLevels(key) : tLevels('unknown')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>{t('description')}</DialogDescription>
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
                                                <Input placeholder={t('additionalInfoPlaceholder')} {...field} value={field.value || ""} />
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
                                                <Input placeholder={t('additionalInfoPlaceholder')} {...field} value={field.value || ""} />
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
                                            <FormLabel>{t('wordTypeLabel')}</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('wordTypePlaceholder')} />
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
                                            <FormLabel>{t('categoryLabel')}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || undefined} value={field.value || undefined}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('categoryPlaceholder')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="root">{t('noCategory')}</SelectItem>
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
                                    <FormLabel>{t('examplesLabel')}</FormLabel>
                                    {examples.map((_, index) => (
                                        <FormField
                                            key={index}
                                            control={form.control}
                                            name={`examples.${index}`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex gap-2">
                                                        <FormControl>
                                                            <Input placeholder={t('examplePlaceholder')} {...field} />
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
                                        {t('addExampleButton')}
                                    </Button>
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <Button type="button" variant="outline" onClick={handleCancel}>
                                        {t('cancelButton')}
                                    </Button>
                                    <Button type="submit">{t('saveButton')}</Button>
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
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('examplesSection')}</p>
                                        <ul className="space-y-1">
                                            {word.examples.map((ex, i) => (
                                                <li key={i} className="text-sm text-muted-foreground border-l-2 border-border pl-3">{ex}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {word.categoryId && (
                                    <div className="text-sm text-muted-foreground">
                                        {t('categoryInfo', { name: categories.data.find(c => c.id === word.categoryId)?.name || t('unknownCategory') })}
                                    </div>
                                )}
                            </div>

                            {word.progress && (
                                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('practiceStats')}</p>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-muted-foreground text-xs">{t('levelLabel')}</p>
                                            <p className={`font-semibold ${LEVEL_COLORS[word.progress.level] ?? ""}`}>
                                                {getLevelLabel(word.progress.level)} ({word.progress.level}/5)
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">{t('repetitionsLabel')}</p>
                                            <p className="font-semibold">{word.progress.repititions}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">{t('correctLabel')}</p>
                                            <p className="font-semibold text-green-600">{word.progress.totalCorrect}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">{t('incorrectLabel')}</p>
                                            <p className="font-semibold text-red-500">{word.progress.totalIncorrect}</p>
                                        </div>
                                        {word.progress.nextReviewAt && (
                                            <div className="col-span-2">
                                                <p className="text-muted-foreground text-xs">{t('nextReviewLabel')}</p>
                                                <p className="font-semibold">
                                                    {format.dateTime(word.progress.nextReviewAt, { dateStyle: 'medium' })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                                <span>{t('createdAt', { date: format.dateTime(word.createdAt, { dateStyle: 'medium' }) })}</span>
                                {word.updatedAt.getTime() !== word.createdAt.getTime() && (
                                    <span>{t('updatedAt', { date: format.dateTime(word.updatedAt, { dateStyle: 'medium' }) })}</span>
                                )}
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setIsEditing(true)}>
                                    {t('editButton')}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
