import {useTRPC} from "@/trpc/client";
import {useSuspenseQuery} from "@tanstack/react-query";
import {useLanguage} from "@/features/user/hooks/use-language";

/**
 * Hook to fetch users stats using suspense
 */
export const useSuspenseLanguageStats = () => {
    const trpc = useTRPC()
    const { currentLanguage } = useLanguage()
    return useSuspenseQuery(trpc.user.getLanguageStats.queryOptions({
        languageId: currentLanguage.id
    }))
}