"use client"

import {z} from "zod";
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import Link from "next/link";
import {authClient} from "@/lib/auth-client";
import {toast} from "sonner";
import Image from "next/image";
import {Language} from "@/generated/prisma/enums";

const registerSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterForm() {

    const router = useRouter();
    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: ""
        }
    })

    async function onSubmit(values: RegisterFormValues) {
        await authClient.signUp.email({
            name: values.email,
            email: values.email,
            password: values.password,
            callbackURL: "/",
            // TODO Make nativeLanguage selectable in the form
            nativeLanguage: Language.GERMAN
        }, {
            onSuccess: () => {
                // TODO Populate UserLanguage Table and Stats after registration. Therefore the user should select target language as well i registration form
                router.push("/")
            },
            onError: (context) => {
                toast.error(context.error.message)
            }
        })
    }

    const isPending = form.formState.isSubmitting

    return <div className="flex flex-col gap-6">
        <Card>
            <CardHeader className="text-center">
                <CardTitle>
                    Get Started
                </CardTitle>
                <CardDescription>
                    Register to get started
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid gap-6">
                            <div className="flex flex-col gap-4">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    type="button"
                                    disabled={isPending}
                                >
                                    <Image src="/logos/github.svg" width={20} height={20} alt="GitHub" />
                                    Continue with GitHub
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    type="button"
                                    disabled={isPending}
                                >
                                    <Image src="/logos/google.svg" width={20} height={20} alt="Google" />
                                    Continue with Google
                                </Button>
                            </div>
                            <div className="grid gap-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="m@example.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="********"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="********"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={isPending}>
                                    Sign up
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Already have an account?{" "}
                                <Link href="/login" className="underline underline-offset-4">
                                    Login
                                </Link>
                            </div>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
}