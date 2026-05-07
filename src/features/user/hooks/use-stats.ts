import {useTRPC} from "@/trpc/client";
import {useQuery} from "@tanstack/react-query";
import {useLanguage} from "@/features/user/hooks/use-language";

export const useLanguageStats = () => {
    const trpc = useTRPC()
    const { currentLanguage, isLoading: isLanguageLoading } = useLanguage()

    const query = useQuery({
        ...trpc.user.getLanguageStats.queryOptions({
            languageId: currentLanguage?.id ?? ""
        }),
        enabled: !!currentLanguage?.id
    })

    return {
        ...query,
        isLoading: isLanguageLoading || query.isLoading
    }
}

export const useWordProgressStats = () => {
    const trpc = useTRPC()
    const { currentLanguage, isLoading: isLanguageLoading } = useLanguage()

    const query = useQuery({
        ...trpc.user.getWordProgressStats.queryOptions(),
        enabled: !!currentLanguage?.id
    })

    return {
        ...query,
        isLoading: isLanguageLoading || query.isLoading
    }
}