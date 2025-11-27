"use client"

import {Button} from "@/components/ui/button";
import {useMutation} from "@tanstack/react-query";
import {useTRPC} from "@/trpc/client";
import {toast} from "sonner";

export default function InngestDemo() {

    const trpc = useTRPC()
    const inngestTestFunction = useMutation(trpc.inngestHelloWorld.mutationOptions({
        onSuccess: (data) => {
            toast.success(data.message)
        },
        onError: (error) => {
            toast.error(error.message)
        }
    }))

    return <div>
        <Button onClick={() => inngestTestFunction.mutate()}>
            Trigger Inngest Function
        </Button>
    </div>
}