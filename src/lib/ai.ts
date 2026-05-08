import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

export const AI_MODEL = "google/gemini-3.1-flash-lite";
