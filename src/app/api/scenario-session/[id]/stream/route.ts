import {type NextRequest} from "next/server"
import {UI_MESSAGE_STREAM_HEADERS} from "ai"
import {after} from "next/server"
import {createResumableStreamContext} from "resumable-stream"
import {loadSession} from "@/features/scenarios/server/session-store"
import {requirePremiumUserFromRequest} from "@/lib/auth-utils"

export async function GET(
    req: NextRequest,
    {params}: {params: Promise<{id: string}>},
) {
    try {
        const {user} = await requirePremiumUserFromRequest(req)
        const {id} = await params

        const session = await loadSession(id, user.id)

        if (!session.activeStreamId) {
            return new Response(null, {status: 204})
        }

        const streamContext = createResumableStreamContext({waitUntil: after})
        const body = await streamContext.resumeExistingStream(session.activeStreamId)

        return new Response(body, {headers: UI_MESSAGE_STREAM_HEADERS})
    } catch (err) {
        if (err instanceof Response) return err
        console.error(err)
        return new Response("Internal Server Error", {status: 500})
    }
}
