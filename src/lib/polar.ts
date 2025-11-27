import {Polar} from "@polar-sh/sdk";

const polarServer = process.env.POLAR_SERVER

if (!polarServer || (polarServer !== "sandbox" && polarServer !== "production")) {
    throw Error("Environment variable POLAR_SERVER must be set to 'sandbox' or 'production'")
}

export const polarClient = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    server: polarServer
});