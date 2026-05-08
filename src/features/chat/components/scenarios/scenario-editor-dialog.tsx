"use client"

import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, PlusIcon, XIcon } from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useUpgradeModal } from "@/hooks/use-upgrade-modal"
import type { Scenario } from "@/generated/prisma/client"

const schema = z.object({
    title: z.string().min(1, "Required").max(100),
    description: z.string().min(1, "Required").max(500),
    image: z.string().min(1, "Required").max(10),
    assistantName: z.string().min(1, "Required").max(50),
    assistantInstructions: z.string().min(1, "Required"),
    firstAssistantMessage: z.string().min(1, "Required"),
    targets: z.array(z.object({ value: z.string().min(1, "Required") })).min(1),
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

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "",
            description: "",
            image: "💬",
            assistantName: "",
            assistantInstructions: "",
            firstAssistantMessage: "",
            targets: [{ value: "" }],
        },
    })

    const { fields, append, remove } = useFieldArray({ control, name: "targets" })

    // Populate form when editing
    useEffect(() => {
        if (scenario) {
            reset({
                title: scenario.title,
                description: scenario.description,
                image: scenario.image,
                assistantName: scenario.assistantName,
                assistantInstructions: scenario.assistantInstructions,
                firstAssistantMessage: scenario.firstAssistantMessage,
                targets: scenario.targets.map(t => ({ value: t })),
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
            })
        }
    }, [scenario, reset, open])

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

    const onSubmit = (values: FormValues) => {
        const data = {
            ...values,
            targets: values.targets.map(t => t.value),
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

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
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
                            <Button type="submit" disabled={isPending}>
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
