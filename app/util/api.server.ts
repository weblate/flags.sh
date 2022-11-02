import { API } from "@encode42/remix-extras";
import { getEnv } from "~/util/getEnv.server";

let api: API;

declare global {
    // eslint-disable-next-line no-var
    var __api: API | undefined;
}

if (process.env.NODE_ENV === "production") {
    api = init();
} else {
    if (!global.__api) {
        global.__api = init();
    }

    api = global.__api;
}

function init() {
    return new API({
        "websiteURL": getEnv("WEBSITE_URL", "unset")
    });
}

export { api };
