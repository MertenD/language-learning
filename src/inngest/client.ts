import { Inngest } from "inngest";

if (!process.env.INNGEST_APP_ID) {
    throw new Error("INNGEST_APP_ID environment variable is not set.");
}

// Create a client to send and receive events
export const inngest = new Inngest({ id: process.env.INNGEST_APP_ID });