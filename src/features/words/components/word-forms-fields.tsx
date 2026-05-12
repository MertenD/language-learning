"use client"

import { Control } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WordType } from "@/features/words/schema/word-crud-schema"

interface WordFormsFieldsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<any>
    wordType: WordType | undefined
    languageCode?: string | null
}

function FormsRow({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-2 gap-3">{children}</div>
}

export function WordFormsFields({ control, wordType, languageCode }: WordFormsFieldsProps) {
    const isGerman = languageCode === "de"
    if (!wordType || wordType === "other") return null

    if (wordType === "noun") return (
        <FormsRow>
            <FormField
                control={control}
                name="forms.gender"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Gender</FormLabel>
                        <FormControl>
                            <Input placeholder="m / f / n" {...field} value={field.value || ""} />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="forms.plural"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Plural</FormLabel>
                        <FormControl>
                            <Input placeholder="Plural form" {...field} value={field.value || ""} />
                        </FormControl>
                    </FormItem>
                )}
            />
        </FormsRow>
    )

    if (wordType === "verb") return (
        <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Conjugation (optional)</p>
            <div className="grid grid-cols-3 gap-2">
                {[
                    { name: "forms.firstPersonSingular",  label: "1. Sg." },
                    { name: "forms.secondPersonSingular", label: "2. Sg." },
                    { name: "forms.thirdPersonSingular",  label: "3. Sg." },
                    { name: "forms.firstPersonPlural",    label: "1. Pl." },
                    { name: "forms.secondPersonPlural",   label: "2. Pl." },
                    { name: "forms.thirdPersonPlural",    label: "3. Pl." },
                ].map(({ name, label }) => (
                    <FormField
                        key={name}
                        control={control}
                        name={name}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs text-muted-foreground">{label}</FormLabel>
                                <FormControl>
                                    <Input className="text-sm" {...field} value={field.value || ""} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                ))}
            </div>
            <FormsRow>
                <FormField
                    control={control}
                    name="forms.pastTense"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Past Tense</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. ging" {...field} value={field.value || ""} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="forms.pastParticiple"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Past Participle</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. gegangen" {...field} value={field.value || ""} />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </FormsRow>
            {isGerman && (
                <FormField
                    control={control}
                    name="forms.auxiliary"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Auxiliary</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="haben / sein" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="haben">haben</SelectItem>
                                    <SelectItem value="sein">sein</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
            )}
        </div>
    )

    if (wordType === "adjective") return (
        <div className="space-y-3">
            <FormsRow>
                <FormField
                    control={control}
                    name="forms.comparative"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Comparative</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. schneller" {...field} value={field.value || ""} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="forms.superlative"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Superlative</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. am schnellsten" {...field} value={field.value || ""} />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </FormsRow>
            <FormField
                control={control}
                name="forms.feminineForm"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Feminine Form (optional)</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. bella (Italian/Spanish)" {...field} value={field.value || ""} />
                        </FormControl>
                    </FormItem>
                )}
            />
        </div>
    )

    return null
}
