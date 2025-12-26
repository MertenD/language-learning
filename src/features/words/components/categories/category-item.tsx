import {Card, CardHeader, CardTitle} from "@/components/ui/card";
import {Folder, MoreVertical, Trash} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useWordsParams} from "@/features/words/hooks/use-words-params";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {WordCategory} from "@/generated/prisma/client";
import {useRemoveCategory} from "@/features/words/hooks/use-categories";

type CategoryItemProps = {
    category: WordCategory
}

export default function CategoryItem({ category }: CategoryItemProps) {
    const [_, setParams] = useWordsParams()
    const removeCategory = useRemoveCategory()

    const handleClick = () => {
        setParams({ categoryId: category.id, page: 1 })
    }

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        removeCategory.mutate({ id: category.id })
    }

    return (
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={handleClick}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    {category.name}
                </CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleRemove} className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
        </Card>
    )
}
