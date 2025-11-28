import {betterAuth} from "better-auth";
import {prismaAdapter} from "better-auth/adapters/prisma";
import prisma from "@/lib/db";
import { polarClient } from "./polar";
import {checkout, polar, portal} from "@polar-sh/better-auth";

if (!process.env.POLAR_SUCCESS_URL) {
    throw Error("Environment variable POLAR_SUCCESS_URL must be set!")
}

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true
    },
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    // TODO Change these products to your products from polar
                    products: [
                        {
                            productId: "6dc851b5-6bcf-46da-91f6-3c7a5066466a",
                            slug: "pro"
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL,
                    authenticatedUsersOnly: true
                }),
                portal()
            ]
        })
    ]
})