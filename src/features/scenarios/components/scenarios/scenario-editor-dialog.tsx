"use client"

import { useEffect, useRef, useState } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, PlusIcon, RefreshCwIcon, SparklesIcon, XIcon } from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"
import { cn } from "@/lib/utils"
import type { Scenario } from "@/generated/prisma/client"

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const

const SUGGESTED_TAGS = [
    "Vergangenheit", "Zukunft", "Konjugation",
    "Präpositionen", "Adjektive", "Zahlen", "Fragen",
]

const schema = z.object({
    title: z.string().min(1, "Required").max(100),
    description: z.string().min(1, "Required").max(500),
    image: z.string().min(1, "Required").max(10),
    assistantName: z.string().min(1, "Required").max(50),
    assistantInstructions: z.string().min(1, "Required"),
    firstAssistantMessage: z.string().min(1, "Required"),
    targets: z.array(z.object({ value: z.string().min(1, "Required") })).min(1),
    level: z.enum(CEFR_LEVELS).optional(),
    tags: z.array(z.object({ value: z.string().min(1) })),
})

type FormValues = z.infer<typeof schema>

interface ScenarioEditorDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    scenario?: Scenario | null
}

export function ScenarioEditorDialog({ open, onOpenChange, scenario }: ScenarioEditorDialogProps) {
    const trpc = useTRPC()
    const queryClient = useQueryClient()
    const { handleError, modal } = useUpgradeModal()

    const isEditing = !!scenario

    const [aiPrompt, setAiPrompt] = useState("")
    const lastPromptRef = useRef("")

    const { register, control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "",
            description: "",
            image: "💬",
            assistantName: "",
            assistantInstructions: "",
            firstAssistantMessage: "",
            targets: [{ value: "" }],
            level: undefined,
            tags: [],
        },
    })

    const { fields, append, remove } = useFieldArray({ control, name: "targets" })
    const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({ control, name: "tags" })

    useEffect(() => {
        if (open) {
            setAiPrompt("")
            lastPromptRef.current = ""
        }
        if (scenario) {
            reset({
                title: scenario.title,
                description: scenario.description,
                image: scenario.image,
                assistantName: scenario.assistantName,
                assistantInstructions: scenario.assistantInstructions,
                firstAssistantMessage: scenario.firstAssistantMessage,
                targets: scenario.targets.map(t => ({ value: t })),
                level: (scenario.level as typeof CEFR_LEVELS[number] | undefined) ?? undefined,
                tags: (scenario.tags ?? []).map(t => ({ value: t })),
            })
        } else {
            reset({
                title: "",
                description: "",
                image: "💬",
                assistantName: "",
                assistantInstructions: "",
                firstAssistantMessage: "",
                targets: [{ value: "" }],
                level: undefined,
                tags: [],
            })
        }
    }, [scenario, reset, open])

    const generateMutation = useMutation(trpc.scenarios.generateSingle.mutationOptions({
        onSuccess: (data) => {
            setValue("title", data.title)
            setValue("description", data.description)
            setValue("image", data.image)
            setValue("assistantName", data.assistantName)
            setValue("assistantInstructions", data.assistantInstructions)
            setValue("firstAssistantMessage", data.firstAssistantMessage)
            setValue("targets", data.targets.map(t => ({ value: t })))
            setValue("level", data.level as typeof CEFR_LEVELS[number] | undefined)
            setValue("tags", data.tags.map(t => ({ value: t })))
        },
        onError: handleError,
    }))

    const handleGenerate = (prompt: string) => {
        lastPromptRef.current = prompt
        generateMutation.mutate({ prompt })
    }

    const invalidate = () => {
        queryClient.invalidateQueries(trpc.scenarios.getUserScenarios.queryOptions())
    }

    const createMutation = useMutation(trpc.scenarios.createUserScenario.mutationOptions({
        onSuccess: () => {
            toast.success("Scenario created")
            invalidate()
            onOpenChange(false)
        },
        onError: handleError,
    }))

    const updateMutation = useMutation(trpc.scenarios.updateUserScenario.mutationOptions({
        onSuccess: () => {
            toast.success("Scenario updated")
            invalidate()
            onOpenChange(false)
        },
        onError: handleError,
    }))

    const isPending = createMutation.isPending || updateMutation.isPending
    const isGenerating = generateMutation.isPending

    const onSubmit = (values: FormValues) => {
        const data = {
            ...values,
            targets: values.targets.map(t => t.value),
            tags: values.tags.map(t => t.value),
            level: values.level,
        }
        if (isEditing && scenario) {
            updateMutation.mutate({ id: scenario.id, ...data })
        } else {
            createMutation.mutate(data)
        }
    }

    return (
        <>
            {modal}
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit Scenario" : "Create Scenario"}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? "Update your custom conversation scenario."
                                : "Design a custom conversation scenario to practice with the AI."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <SparklesIcon className="h-4 w-4 text-primary" />
                            Mit KI ausfüllen
                        </div>
                        <Textarea
                            value={aiPrompt}
                            onChange={e => setAiPrompt(e.target.value)}
                            placeholder={'Beschreibe kurz das Szenario, z.B. "Ich will im Restaurant auf Spanisch bestellen und nach Empfehlungen fragen."'}
                            rows={2}
                            className="bg-background resize-none"
                            disabled={isGenerating}
                        />
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => handleGenerate(aiPrompt)}
                                disabled={isGenerating || !aiPrompt.trim()}
                                className="gap-2"
                            >
                                {isGenerating
                                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generiere…</>
                                    : <><SparklesIcon className="h-3.5 w-3.5" /> Generieren</>
                                }
                            </Button>
                            {lastPromptRef.current && !isGenerating && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleGenerate(lastPromptRef.current)}
                                    className="gap-2"
                                >
                                    <RefreshCwIcon className="h-3.5 w-3.5" />
                                    Neu generieren
                                </Button>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex gap-3">
                            <div className="space-y-1.5 w-20">
                                <Label>Emoji</Label>
                                <Input {...register("image")} className="text-center text-lg" maxLength={10} />
                                {errors.image && <p className="text-xs text-destructive">{errors.image.message}</p>}
                            </div>
                            <div className="space-y-1.5 flex-1">
                                <Label>Title</Label>
                                <Input {...register("title")} placeholder="e.g. At the restaurant" />
                                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Description</Label>
                            <Textarea {...register("description")} placeholder="Short description of the scenario..." rows={2} />
                            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Assistant Name</Label>
                            <Input {...register("assistantName")} placeholder="e.g. Maria, Waiter, Doctor" />
                            {errors.assistantName && <p className="text-xs text-destructive">{errors.assistantName.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label>
                                CEFR Level{" "}
                                <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                            </Label>
                            <Controller
                                control={control}
                                name="level"
                                render={({ field }) => (
                                    <Select
                                        value={field.value ?? ""}
                                        onValueChange={val => field.onChange(val || undefined)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select difficulty level..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CEFR_LEVELS.map(l => (
                                                <SelectItem key={l} value={l}>{l}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>
                                Topic Tags{" "}
                                <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                            </Label>
                            <div className="flex flex-wrap gap-1.5">
                                {SUGGESTED_TAGS.map(tag => {
                                    const idx = tagFields.findIndex(f => f.value === tag)
                                    const isActive = idx !== -1
                                    return (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => isActive ? removeTag(idx) : appendTag({ value: tag })}
                                            className={cn(
                                                "rounded-full px-2.5 py-0.5 text-xs border transition-colors",
                                                isActive
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-muted text-muted-foreground border-transparent hover:border-border"
                                            )}
                                        >
                                            {tag}
                                        </button>
                                    )
                                })}
                            </div>
                            {tagFields.map((field, i) => !SUGGESTED_TAGS.includes(field.value) && (
                                <div key={field.id} className="flex gap-2">
                                    <Input
                                        {...register(`tags.${i}.value`)}
                                        placeholder="Custom tag..."
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeTag(i)}>
                                        <XIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => appendTag({ value: "" })}
                            >
                                <PlusIcon className="mr-2 h-3.5 w-3.5" />
                                Add custom tag
                            </Button>
                        </div>

                        <div className="space-y-1.5">
                            <Label>System Instructions</Label>
                            <Textarea
                                {...register("assistantInstructions")}
                                placeholder="Describe the assistant's role and behavior..."
                                rows={3}
                            />
                            {errors.assistantInstructions && <p className="text-xs text-destructive">{errors.assistantInstructions.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label>First Message</Label>
                            <Textarea
                                {...register("firstAssistantMessage")}
                                placeholder="The opening message the assistant sends..."
                                rows={2}
                            />
                            {errors.firstAssistantMessage && <p className="text-xs text-destructive">{errors.firstAssistantMessage.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Learning Targets</Label>
                            {fields.map((field, i) => (
                                <div key={field.id} className="flex gap-2">
                                    <Input
                                        {...register(`targets.${i}.value`)}
                                        placeholder={`Target ${i + 1}...`}
                                    />
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(i)}
                                        >
                                            <XIcon className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {fields.length < 10 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ value: "" })}
                                >
                                    <PlusIcon className="mr-2 h-3.5 w-3.5" />
                                    Add target
                                </Button>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending || isGenerating}>
                                {isPending
                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                                    : isEditing ? "Save changes" : "Create scenario"
                                }
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
