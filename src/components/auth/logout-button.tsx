"use client"

import {Button} from "@/components/ui/button";
import {authClient} from "@/lib/auth-client";
import {useRouter} from "next/navigation";

export default function LogoutButton() {

    const { data } = authClient.useSession()
    const router = useRouter()

    return <Button onClick={() => {
        authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.refresh()
                }
            }
        })

    }} disabled={!data}>
        Sign Out
    </Button>
}