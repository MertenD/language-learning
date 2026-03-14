import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/features/user/hooks/use-language";

/**
 * Hook to fetch recent activities for the current language
 */
export const useRecentActivities = () => {
    const trpc = useTRPC();
    const { currentLanguage, isLoading: isLanguageLoading } = useLanguage();

    const query = useQuery({
        ...trpc.user.getRecentActivities.queryOptions({
            languageId: currentLanguage?.id ?? ""
        }),
        enabled: !!currentLanguage?.id
    });

    return {
        ...query,
        isLoading: isLanguageLoading || query.isLoading
    };
};
