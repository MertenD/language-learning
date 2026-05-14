"use client"

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {profileSchema, type ProfileFormValues} from "@/features/settings/schema/settings-schema";
import {authClient} from "@/lib/auth-client";
import {toast} from "sonner";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

export default function ProfileTab() {
    const { data: session, refetch } = authClient.useSession()
    const user = session?.user

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name ?? "",
            image: user?.image ?? "",
        }
    })

    const imageValue = form.watch("image")
    const nameValue = form.watch("name")

    async function onSubmit(values: ProfileFormValues) {
        await authClient.updateUser({
            name: values.name,
            image: values.image || undefined,
        }, {
            onSuccess: () => {
                toast.success("Profile updated")
                refetch()
            },
            onError: (ctx) => {
                toast.error(ctx.error.message)
            }
        })
    }

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your display name and avatar.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={imageValue || undefined} />
                                <AvatarFallback className="text-lg font-semibold">
                                    {nameValue?.[0]?.toUpperCase() ?? "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-sm text-muted-foreground">
                                <p className="font-medium text-foreground">{nameValue || "Your Name"}</p>
                                <p>{user?.email}</p>
                            </div>
                        </div>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Display Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Avatar URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://example.com/avatar.png" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Saving…" : "Save Changes"}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}
