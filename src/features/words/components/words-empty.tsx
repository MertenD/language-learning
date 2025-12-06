import {EmptyView} from "@/components/entity-components";
import {useCreateWord} from "@/features/words/hooks/use-words";
import {useUpgradeModal} from "@/hooks/use-upgrade-modal";

export default function WordsEmpty() {
    const createWord = useCreateWord()
    const { handleError, modal } = useUpgradeModal()

    // TODO Create real word item
    const handleCreate = () => {
        createWord.mutate({
            german: "Brot",
            serbian: "Hleb"
        }, {
            onError: (error) => {
                handleError(error)
            }
        })
    }

    return <>
        {modal}
        <EmptyView
            onNew={handleCreate}
            message="No words found. Get started by adding a word!"
        />
    </>
}