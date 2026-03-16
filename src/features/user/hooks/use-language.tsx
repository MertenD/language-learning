"use client"

import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {Language} from "@/generated/prisma/client";
import {authClient} from "@/lib/auth-client";
import {useTRPC} from "@/trpc/client";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";

interface LanguageContextType {
    currentLanguage?: Language
    availableLanguages: Language[]
    setCurrentLanguage: (language: Language) => void
    isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
    children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const trpc = useTRPC()
    const queryClient = useQueryClient()
    const { data: session, isPending: isSessionLoading, refetch: refetchSession } = authClient.useSession()

    const { data: languages, isLoading: isLanguagesLoading, refetch: refetchLanguages } = useQuery(
        trpc.user.getLanguages.queryOptions()
    )

    const availableLanguages = languages || []

    const [optimisticLanguageId, setOptimisticLanguageId] = useState<string | undefined>(undefined)

    const setLanguageMutation = useMutation({
        ...trpc.user.setLanguage.mutationOptions(),
        onMutate: ({ languageId }) => {
            setOptimisticLanguageId(languageId);
            return undefined;
        },
        onSuccess: async () => {
            await refetchSession()
            await queryClient.invalidateQueries()
        },
        onError: (error) => {
            toast.error("Failed to change language: " + error.message)
            setOptimisticLanguageId(undefined)
        }
    })

    const currentLanguageId = optimisticLanguageId ?? session?.user?.currentLanguageId
    const currentLanguage = availableLanguages.find(l => l.id === currentLanguageId)

    // Reset optimistic language once session catches up
    useEffect(() => {
        if (optimisticLanguageId && session?.user?.currentLanguageId === optimisticLanguageId) {
            setOptimisticLanguageId(undefined)
        }
    }, [session?.user?.currentLanguageId, optimisticLanguageId])

    // Refetch languages when session becomes available to ensure we have data
    useEffect(() => {
        if (session?.user) {
            refetchLanguages()
        }
    }, [session?.user?.id, refetchLanguages])

    const setCurrentLanguage = (language: Language) => {
        if (language.id === currentLanguage?.id) return
        setLanguageMutation.mutate({ languageId: language.id })
    }

    const isLoading = isSessionLoading || isLanguagesLoading || (availableLanguages.length > 0 && !currentLanguage)

    return (
        <LanguageContext.Provider value={{
            currentLanguage,
            availableLanguages,
            setCurrentLanguage,
            isLoading
        }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
