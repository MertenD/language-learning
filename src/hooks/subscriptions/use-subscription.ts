import {useQuery} from "@tanstack/react-query";
import {authClient} from "@/lib/auth-client";

export const useSubscription = () => {
    return useQuery({
        queryKey: ["subscription"],
        queryFn: async () => {
            const { data } = await authClient.customer.state()
            return data
        }
    })
}

export const useHasActiveSubscription = () => {
    const { data: customerState, isLoading, ...rest} = useSubscription()

    // Assuming the user can only have one subscription at the time
    const hasActiveSubscription =
        customerState?.activeSubscriptions &&
        customerState.activeSubscriptions.length > 0

    return {
        hasActiveSubscription,
        subscription: customerState?.activeSubscriptions?.[0],
        isLoading,
        ...rest
    }
}