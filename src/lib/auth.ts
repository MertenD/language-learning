import {betterAuth} from "better-auth";
import {prismaAdapter} from "better-auth/adapters/prisma";
import prisma from "@/lib/db";
import { polarClient } from "./polar";
import {checkout, polar, portal} from "@polar-sh/better-auth";
import {ActivityType} from "@/features/dashboard/model/activity-type";

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
    user: {
        additionalFields: {
            nativeLanguageId: {
                type: "string",
                required: true
            },
            currentLanguageId: {
                type: "string",
                required: true
            }
        }
    },
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: false, // Is created manually in the user create hook below
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
    ],
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    const targetLanguageId = (user.currentLanguageId || "1") as string
                    let polarCustomer = null

                    try {
                        if (!user.currentLanguageId) {
                            // Set the default target language for new users if not provided
                             await prisma.user.update({
                                where: { id: user.id },
                                data: { currentLanguageId: targetLanguageId }
                            })
                        }

                        await prisma.userLanguage.create({
                            data: {
                                user: {
                                    connect: {
                                        id: user.id
                                    }
                                },
                                language: {
                                    connect: {
                                        id: targetLanguageId
                                    }
                                },
                                stats: {
                                    create: {
                                        streakStartedAt: new Date(),
                                        lastActivityAt: new Date(),
                                    }
                                },
                                activities: {
                                    create: {
                                        type: ActivityType.LANGUAGE_STARTED,
                                        timestamp: new Date()
                                    }
                                }
                            }
                        })

                        polarCustomer = await polarClient.customers.create({
                            externalId: user.id,
                            email: user.email,
                            name: user.name
                        })
                    } catch (error) {
                        console.error("Error creating user language or polar customer:", error)

                        // Rollback: Delete the created user language and polar customer if they were created

                        if (polarCustomer) {
                            try {
                                await polarClient.customers.delete({
                                    id: polarCustomer.id
                                })
                            } catch (polarError) {
                                console.error("Error rolling back polar customer:", polarError)
                            }
                        }

                        await prisma.user.delete({
                            where: {
                                id: user.id
                            }
                        })

                        throw error
                    }
                }
            }
        }
    }
})