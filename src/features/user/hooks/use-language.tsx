"use client"

import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {Language} from "@/generated/prisma/client";
import {authClient} from "@/lib/auth-client";
import {useTRPC} from "@/trpc/client";
import {useMutation, useQuery} from "@tanstack/react-query";
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
    const { data: session, isPending: isSessionLoading, refetch: refetchSession } = authClient.useSession()

    const { data: languages, isLoading: isLanguagesLoading, refetch: refetchLanguages } = useQuery(
        trpc.user.getLanguages.queryOptions()
    )

    const availableLanguages = languages || []

    const [currentLanguage, setCurrentLanguageState] = useState<Language | undefined>(undefined)

    // Initialize language from session
    useEffect(() => {
        if (availableLanguages.length === 0) return

        let foundLanguage: Language | undefined

        // Try to match session language
        if (session?.user?.currentLanguageId) {
             const sessionLanguage = availableLanguages.find(l => l.id === session.user.currentLanguageId)
             if (sessionLanguage) {
                 foundLanguage = sessionLanguage
             }
        }

        // Fallback to first available language if session language not found or not set
        if (!foundLanguage && availableLanguages.length > 0) {
            foundLanguage = availableLanguages[0]
        }

        // Only update state if:
        // 1. We haven't set a language yet (initial load)
        // 2. The session language has changed and doesn't match our current state (e.g. external update)
        // We avoid resetting if the user just clicked switch (optimistic update) by relying on session prop update
        if (foundLanguage && (!currentLanguage || (session?.user?.currentLanguageId && currentLanguage.id !== session.user.currentLanguageId && currentLanguage.id !== foundLanguage.id))) {
             if (currentLanguage?.id !== foundLanguage.id) {
                 setCurrentLanguageState(foundLanguage)
             }
        }

    }, [availableLanguages, session])

    // Refetch languages when session becomes available to ensure we have data
    useEffect(() => {
        if (session?.user) {
            refetchLanguages()
        }
    }, [session?.user?.id, refetchLanguages])

    const setLanguageMutation = useMutation({
        ...trpc.user.setLanguage.mutationOptions(),
        onSuccess: () => {
             // Invalidate session to reflect the language change
             refetchSession()
        },
        onError: (error) => {
            toast.error("Failed to change language: " + error.message)
        }
    })

    const setCurrentLanguage = (language: Language) => {
        setCurrentLanguageState(language)
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
