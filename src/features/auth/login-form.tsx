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
import {useTranslations} from "next-intl";

export default function LoginForm() {
    const router = useRouter();
    const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null)
    const t = useTranslations('auth.login');

    const loginSchema = z.object({
        email: z.email(t('validation.emailInvalid')),
        password: z.string().min(1, t('validation.passwordRequired')),
    })
    type LoginFormValues = z.infer<typeof loginSchema>

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
                    {t('title')}
                </CardTitle>
                <CardDescription>
                    {t('description')}
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
                                    {oauthLoading === 'github' ? t('redirecting') : t('continueWithGithub')}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => signInWith('google')}
                                >
                                    <Image src="/logos/google.svg" width={20} height={20} alt="Google" />
                                    {oauthLoading === 'google' ? t('redirecting') : t('continueWithGoogle')}
                                </Button>
                            </div>
                            <div className="grid gap-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('emailLabel')}</FormLabel>
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
                                            <FormLabel>{t('passwordLabel')}</FormLabel>
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
                                    {t('submitButton')}
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                {t('noAccount')}{" "}
                                <Link href="/signup" className="underline underline-offset-4">
                                    {t('signUpLink')}
                                </Link>
                            </div>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
}
