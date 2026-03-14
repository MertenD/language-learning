import {createAuthClient} from "better-auth/react";
import {polarClient} from "@polar-sh/better-auth";
import {inferAdditionalFields} from "better-auth/client/plugins";

export const authClient = createAuthClient({
    plugins: [
        polarClient(),
        inferAdditionalFields({
            user: {
                nativeLanguageId: {
                    type: "string",
                    required: true
                },
                currentLanguageId: {
                    type: "string",
                    required: false
                }
            }
        })
    ]
})