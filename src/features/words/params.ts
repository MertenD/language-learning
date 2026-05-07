import {parseAsInteger, parseAsString, parseAsStringEnum} from "nuqs/server";
import {PAGINATION} from "@/config/constants";

export const SORT_BY_OPTIONS = ["updatedAt", "createdAt", "primary", "secondary"] as const
export const SORT_ORDER_OPTIONS = ["asc", "desc"] as const

export const wordsParams = {
    page: parseAsInteger
        .withDefault(PAGINATION.DEFAULT_PAGE)
        .withOptions({ clearOnDefault: true }),
    pageSize: parseAsInteger
        .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
        .withOptions({ clearOnDefault: true }),
    search: parseAsString
        .withDefault("")
        .withOptions({ clearOnDefault: true }),
    categoryId: parseAsString
        .withDefault("")
        .withOptions({ clearOnDefault: true }),
    sortBy: parseAsStringEnum([...SORT_BY_OPTIONS])
        .withDefault("updatedAt")
        .withOptions({ clearOnDefault: true }),
    sortOrder: parseAsStringEnum([...SORT_ORDER_OPTIONS])
        .withDefault("desc")
        .withOptions({ clearOnDefault: true }),
}