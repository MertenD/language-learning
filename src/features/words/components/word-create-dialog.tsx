"use client"

import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {CreateWordInput, createWordSchema} from "@/features/words/schema/word-crud-schema";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {useEffect} from "react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useSuspenseAllCategories} from "@/features/words/hooks/use-categories";

interface WordCreateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreate: (newWord: CreateWordInput) => void | Promise<void>
    categoryId?: string
}

export function WordCreateDialog({ open, onOpenChange, onCreate, categoryId }: WordCreateDialogProps) {
    const categories = useSuspenseAllCategories()

    const form = useForm<CreateWordInput>({
        resolver: zodResolver(createWordSchema),
        defaultValues: {
             primary: "",
            primaryInfo: "",
            secondary: "",
            secondaryInfo: "",
            categoryId: categoryId || undefined
        }
    })

    // Reset form when dialog opens/closes or categoryId changes
    useEffect(() => {
        if (open) {
            form.reset({
                primary: "",
                primaryInfo: "",
                secondary: "",
                secondaryInfo: "",
                categoryId: categoryId || undefined
            })
        }
    }, [open, categoryId, form])

    function onSubmit(data: CreateWordInput) {
        const formattedData: CreateWordInput = {
            ...data,
            primaryInfo: data.primaryInfo || undefined,
            secondaryInfo: data.secondaryInfo || undefined,
            categoryId: data.categoryId === "root" ? undefined : (data.categoryId || undefined)
        }

        onCreate(formattedData)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
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
                                            <span className="text-2xl">🇩🇪</span> German
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="German word" {...field} />
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
                                            <span className="text-2xl">🇷🇸</span> Serbian
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Serbian word" {...field} />
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
