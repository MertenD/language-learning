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
import {useTRPC} from "@/trpc/client";
import {useQuery} from "@tanstack/react-query";
import {ComboboxLanguage} from "@/components/combobox-language";
import {useTranslations} from "next-intl";

export default function RegisterForm() {
    const router = useRouter();
    const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null)
    const trpc = useTRPC();
    const { data: languages, isLoading: isLanguagesLoading } = useQuery(trpc.user.getAvailableLanguages.queryOptions());
    const t = useTranslations('auth.register');

    const registerSchema = z.object({
        email: z.email(t('validation.emailInvalid')),
        password: z.string().min(1, t('validation.passwordRequired')).min(8, t('validation.passwordMinLength')),
        confirmPassword: z.string(),
        nativeLanguageId: z.string().min(1, t('validation.nativeLanguageRequired')),
        targetLanguageId: z.string().min(1, t('validation.targetLanguageRequired'))
    }).refine((data) => data.password === data.confirmPassword, {
        message: t('validation.passwordsMismatch'),
        path: ["confirmPassword"]
    }).refine((data) => data.nativeLanguageId !== data.targetLanguageId, {
        message: t('validation.languagesSame'),
        path: ["targetLanguageId"]
    })

    type RegisterFormValues = z.infer<typeof registerSchema>

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            nativeLanguageId: "",
            targetLanguageId: ""
        }
    })

    async function onSubmit(values: RegisterFormValues) {
        await authClient.signUp.email({
            name: values.email,
            email: values.email,
            password: values.password,
            callbackURL: "/",
            nativeLanguageId: values.nativeLanguageId,
            currentLanguageId: values.targetLanguageId
        }, {
            onSuccess: () => {
                router.push("/")
            },
            onError: (context) => {
                toast.error(context.error.message)
            }
        })
    }

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
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('confirmPasswordLabel')}</FormLabel>
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
                                    name="nativeLanguageId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('nativeLanguageLabel')}</FormLabel>
                                            <FormControl>
                                                <ComboboxLanguage
                                                    languages={languages || []}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder={t('nativeLanguagePlaceholder')}
                                                    disabled={isLanguagesLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="targetLanguageId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('targetLanguageLabel')}</FormLabel>
                                            <FormControl>
                                                <ComboboxLanguage
                                                    languages={languages || []}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder={t('targetLanguagePlaceholder')}
                                                    disabled={isLanguagesLoading}
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
                                {t('alreadyHaveAccount')}{" "}
                                <Link href="/login" className="underline underline-offset-4">
                                    {t('loginLink')}
                                </Link>
                            </div>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
}
