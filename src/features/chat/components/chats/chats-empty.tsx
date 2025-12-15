import {EmptyView} from "@/components/entity-components";
import {toast} from "sonner";

export default function ChatsEmpty() {
    return <>
        <EmptyView
            onNew={() => toast.message("Work in progress: Create Chat here")}
            message="No chats found. Get started by starting a new chat."
        />
    </>
}