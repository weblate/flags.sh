/**
 * The website's details and links.
 */
import { Environments } from "../data/Environments";

export const SiteDetails = {
    "title": "flags.sh",
    "description": "A simple script generator to start your Minecraft servers with optimal flags.",
    "favicon": "/favicon.ico",
    "logo": "/asset/logo.png",
    "links": {
        "github": "https://github.com/Encode42/flags.sh",
        "support": "https://encode42.dev/support"
    }
};

export function findEnvironment(key: string) {
    let result;

    for (const value of Environments.types) {
        if (key === value.key) {
            result = value;
            break;
        }
    }

    return result;
}
