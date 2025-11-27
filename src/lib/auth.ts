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
                            productId: "54473369-ea20-4d3b-90de-16f7883e7be2",
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