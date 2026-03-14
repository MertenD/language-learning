import prisma from "@/lib/db";
import {ActivityType} from "@/generated/prisma/enums";

/**
 * Tracks a user activity for a specific language.
 * If the user language record doesn't exist, it won't be tracked
 */
export async function trackActivity(
    userId: string,
    languageId: string,
    type: ActivityType
) {
    // 1. Find the UserLanguage recordID
    const userLanguage = await prisma.userLanguage.findUnique({
        where: {
            userId_languageId: {
                userId,
                languageId
            }
        },
        select: { id: true }
    });

    if (!userLanguage) {
        console.warn(`Cannot track activity ${type}: UserLanguage not found for user ${userId} and language ${languageId}`);
        return;
    }

    // 2. Create the activity
    await prisma.userLanguageActivity.create({
        data: {
            type,
            userLanguageId: userLanguage.id
        }
    });
}

