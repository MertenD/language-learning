import {EmptyView} from "@/components/entity-components";
import {useUpgradeModal} from "@/hooks/use-upgrade-modal";
import {useCreateGrammar} from "@/features/grammar/hooks/use-grammar";
import {useState} from "react";
import {CreateGrammarInput} from "@/features/grammar/schema/grammar-crud-schema";
import {GrammarCreateDialog} from "@/features/grammar/components/grammar-create-dialog";

export default function GrammarEmpty() {
    const createGrammar = useCreateGrammar()
    const { handleError, modal } = useUpgradeModal()
    const [isOpen, setIsOpen] = useState(false)

    const handleCreate = (newGrammar: CreateGrammarInput) => {
        createGrammar.mutate(newGrammar, {
            onSuccess: () => {
                setIsOpen(false)
            },
            onError: (error) => {
                handleError(error)
            }
        })
    }

    return <>
        {modal}
        <EmptyView
            onNew={() => setIsOpen(true)}
            message="No grammar entries found. Get started by adding a grammar rule!"
        />
        <GrammarCreateDialog open={isOpen} onOpenChange={setIsOpen} onCreate={handleCreate} />
    </>
}