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
import {useState} from "react";

const loginSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required")
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginForm() {

    const router = useRouter();
    const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null)
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    async function signInWith(provider: 'github' | 'google') {
        setOauthLoading(provider)
        await authClient.signIn.social({
            provider,
            callbackURL: '/',
        }, {
            onError: (ctx) => {
                toast.error(ctx.error.message)
                setOauthLoading(null)
            }
        })
    }

    async function onSubmit(values: LoginFormValues) {
        await authClient.signIn.email({
            email: values.email,
            password: values.password,
            callbackURL: "/"
        }, {
            onSuccess: () => {
                router.push("/")
            },
            onError: (context) => {
                toast.error(context.error.message)
            }
        })
    }

    const isPending = form.formState.isSubmitting || oauthLoading !== null

    return <div className="flex flex-col gap-6">
        <Card>
            <CardHeader className="text-center">
                <CardTitle>
                    Welcome back
                </CardTitle>
                <CardDescription>
                    Login to continue
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
                                    onClick={() => signInWith('github')}
                                >
                                    <Image src="/logos/github.svg" width={20} height={20} alt="GitHub" />
                                    {oauthLoading === 'github' ? 'Redirecting…' : 'Continue with GitHub'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => signInWith('google')}
                                >
                                    <Image src="/logos/google.svg" width={20} height={20} alt="Google" />
                                    {oauthLoading === 'google' ? 'Redirecting…' : 'Continue with Google'}
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
                                <Button type="submit" className="w-full" disabled={isPending}>
                                    Login
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Don&apos;t have an account?{" "}
                                <Link href="/signup" className="underline underline-offset-4">
                                    Sign up
                                </Link>
                            </div>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
}