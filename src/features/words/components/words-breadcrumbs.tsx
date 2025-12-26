"use client"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {useWordsParams} from "@/features/words/hooks/use-words-params";
import {Fragment} from "react";
import {useCategoryPath} from "@/features/words/hooks/use-categories";

export default function WordsBreadcrumbs() {
    const [params, setParams] = useWordsParams()
    const { data: path } = useCategoryPath(params.categoryId || null)

    const handleNavigate = (categoryId: string | null) => {
        setParams({ categoryId, page: 1 })
    }

    return (
        <Breadcrumb className="mb-4">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink
                        className="cursor-pointer"
                        onClick={() => handleNavigate(null)}
                    >
                        Root
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {path?.map((category, index) => (
                    <Fragment key={category.id}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            {index === path.length - 1 ? (
                                <BreadcrumbPage>{category.name}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink
                                    className="cursor-pointer"
                                    onClick={() => handleNavigate(category.id)}
                                >
                                    {category.name}
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}

