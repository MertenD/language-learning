import prisma from "@/lib/db";
import {ActivityType} from "@/features/dashboard/model/activity-type";

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
    try {
        await prisma.userLanguageActivity.create({
            data: {
                type,
                userLanguageId: userLanguage.id
            }
        });
    } catch (error) {
        console.error(`Failed to track activity ${type} for user ${userId}`, error);
        // We swallow the error here so that the main action (e.g. creating vocabulary)
        // doesn't fail just because tracking failed
    }
}
