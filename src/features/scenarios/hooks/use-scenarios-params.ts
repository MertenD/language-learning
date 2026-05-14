"use client"

import {useQueryStates} from "nuqs";
import {scenariosParams} from "@/features/scenarios/params";

export const useScenariosParams = () => {
    return useQueryStates(scenariosParams)
}
