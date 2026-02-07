"use client"

import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {Language} from "@/generated/prisma/client";

interface LanguageContextType {
    currentLanguage: Language
    availableLanguages: Language[]
    setCurrentLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
    children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const availableLanguages: Language[] = [{
        id: "0",
        code: "de",
        name: "german",
        flagEmoji: "🇩🇪",
        createdAt: new Date(),
        updatedAt: new Date()
    },{
        id: "1",
        code: "rs",
        name: "serbian",
        flagEmoji: "🇷🇸",
        createdAt: new Date(),
        updatedAt: new Date()
    }] // TODO Replace by actual available languages for the current user

    const [currentLanguage, setCurrentLanguageState] = useState<Language>(availableLanguages[0])

    useEffect(() => {
        const savedLanguageId = localStorage.getItem("currentLanguageId")
        const savedLanguage = availableLanguages.find(lang => lang.id === savedLanguageId)

        if (savedLanguage) {
            setCurrentLanguageState(savedLanguage)
        } else {
            localStorage.setItem("currentLanguageId", availableLanguages[0].id)
        }
    }, [])

    const setCurrentLanguage = (language: Language) => {
        setCurrentLanguageState(language)
        localStorage.setItem("currentLanguageId", language.id)
    }

    return (
        <LanguageContext.Provider
            value={{
                currentLanguage,
                availableLanguages,
                setCurrentLanguage
            }}
        >
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
