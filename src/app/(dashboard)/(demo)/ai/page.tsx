"use client"

import {Button} from "@/components/ui/button";
import {useMutation} from "@tanstack/react-query";
import {useTRPC} from "@/trpc/client";
import {toast} from "sonner";

export default function AiDemo() {
    const trpc = useTRPC()
    const testAi = useMutation(trpc.testAI.mutationOptions({
        onSuccess: (data) => {
            toast.success(data.message)
        },
        onError: (error) => {
            toast.error(error.message)
        }
    }))

    return <div>
        <Button disabled={testAi.isPending} onClick={() => testAi.mutate()} className="mb-8">
            Ask AI
        </Button>
    </div>
}