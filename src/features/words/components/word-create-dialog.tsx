"use client"

import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {CreateWordInput, createWordSchema, WORD_TYPE_LABELS, WordType} from "@/features/words/schema/word-crud-schema";
import {WordFormsFields} from "@/features/words/components/word-forms-fields";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {useEffect} from "react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useSuspenseAllCategories} from "@/features/words/hooks/use-categories";
import {useLanguage, useNativeLanguage} from "@/features/user/hooks/use-language";
import {PlusIcon, Trash2Icon} from "lucide-react";

interface WordCreateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreate: (newWord: CreateWordInput) => void | Promise<void>
    categoryId?: string
}

export function WordCreateDialog({ open, onOpenChange, onCreate, categoryId }: WordCreateDialogProps) {
    const categories = useSuspenseAllCategories()
    const { currentLanguage } = useLanguage()
    const { data: nativeLanguage } = useNativeLanguage()

    const form = useForm<CreateWordInput>({
        resolver: zodResolver(createWordSchema),
        defaultValues: {
            primary: "",
            primaryInfo: "",
            secondary: "",
            secondaryInfo: "",
            categoryId: categoryId || undefined,
            examples: [],
            wordType: undefined,
            forms: {},
        }
    })

    useEffect(() => {
        if (open) {
            form.reset({
                primary: "",
                primaryInfo: "",
                secondary: "",
                secondaryInfo: "",
                categoryId: categoryId || undefined,
                examples: [],
                wordType: undefined,
                forms: {},
            })
        }
    }, [open, categoryId, form])

    function onSubmit(data: CreateWordInput) {
        const formattedData: CreateWordInput = {
            ...data,
            primaryInfo: data.primaryInfo || undefined,
            secondaryInfo: data.secondaryInfo || undefined,
            categoryId: data.categoryId === "root" ? undefined : (data.categoryId || undefined),
            examples: data.examples?.filter(e => e.trim().length > 0) ?? []
        }

        onCreate(formattedData)
    }

    const examples = form.watch("examples") ?? []
    const wordType = form.watch("wordType") as WordType | undefined

    const addExample = () => {
        form.setValue("examples", [...examples, ""])
    }

    const removeExample = (index: number) => {
        form.setValue("examples", examples.filter((_, i) => i !== index))
    }

    const primaryLabel = nativeLanguage
        ? `${nativeLanguage.flagEmoji} ${nativeLanguage.name}`
        : "Primary"
    const secondaryLabel = currentLanguage
        ? `${currentLanguage.flagEmoji} ${currentLanguage.name}`
        : "Secondary"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Vocabulary Details</DialogTitle>
                    <DialogDescription>Create new vocabulary.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                        <div className="space-y-4">
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
                                            <Input placeholder={`${primaryLabel} word`} {...field} />
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
                                            <Input placeholder={`${secondaryLabel} word`} {...field} />
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
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Create</Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
