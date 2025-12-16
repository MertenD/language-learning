import {parseAsInteger, parseAsString} from "nuqs/server";
import {PAGINATION} from "@/config/constants";

export const chatsParams = {
    page: parseAsInteger
        .withDefault(PAGINATION.DEFAULT_PAGE)
        .withOptions({ clearOnDefault: true }),
    pageSize: parseAsInteger
        .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
        .withOptions({ clearOnDefault: true }),
    search: parseAsString
        .withDefault("")
        .withOptions({ clearOnDefault: true }),
}

export const scenariosParams = {
    scenariosPage: parseAsInteger
        .withDefault(PAGINATION.DEFAULT_PAGE)
        .withOptions({ clearOnDefault: true }),
    scenariosPageSize: parseAsInteger
        .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
        .withOptions({ clearOnDefault: true }),
    scenariosSearch: parseAsString
        .withDefault("")
        .withOptions({ clearOnDefault: true }),
}
