import { Environments, EnvironmentType } from "../data/Environments";
import { Flags, FlagType } from "../data/Flags";
import { Keyed } from "./Keyed";

/**
 * The website's details and links.
 */
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

/**
 * The result of {@see findKey}.
 */
interface KeyResult<T> {
    /**
     * Resulting object from the set.
     */
    "result": T,

    /**
     * Index of that resulting object.
     */
    "index": number
}

/**
 * Find a key from a set.
 *
 * @param set Set to iterate
 * @param key Key to search for
 */
function findKey<T extends Keyed>(set: T[], key: string): KeyResult<T> {
    let result;
    let i = 0;

    for (; i < set.length; i++) {
        if (key === set[i]?.key) {
            // Key found, return early
            result = set[i];
            break;
        }
    }

    return {
        result,
        "index": i
    };
}

/**
 * Find a key from the environments set.
 *
 * @param key Key to search for
 */
export function findEnvironment(key: string) {
    return findKey<EnvironmentType>(Environments.types, key);
}

/**
 * Find a key from the flags set.
 *
 * @param key Key to search for
 */
export function findFlag(key: string) {
    return findKey<FlagType>(Flags.types, key);
}
