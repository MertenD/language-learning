import { inngest } from "./client";
import {generateText} from "ai";
import {createGoogleGenerativeAI} from "@ai-sdk/google";

const google = createGoogleGenerativeAI()

export enum InngestEvents {
    TestHelloWorld = "test/hello.world",
    ExecuteAI = "execute/ai"
}

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: InngestEvents.TestHelloWorld },
    async ({ event, step }) => {
        await step.sleep("wait-a-moment", "1s");
        return { message: `Hello ${event.data.email}!` };
    },
);

export const executeAI = inngest.createFunction(
    { id: "execute-ai"},
    { event: InngestEvents.ExecuteAI },
    async ({ event, step }) => {
        const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
            model: google("gemini-2.5-flash"),
            system: "You are a helpful assistant",
            prompt: "What is 2+2?",
            experimental_telemetry: {
                isEnabled: true,
                recordInputs: true,
                recordOutputs: true,
            },
        })

        return steps
    }
)