import { Flags } from "../data/Flags";

/**
 * Data for a flag in the selector.
 */
export interface FlagSelector {
    /**
     * Key of the entry.
     */
    "value": string,

    /**
     * Label of the entry.
     */
    "label": string,

    /**
     * Description of the entry.
     */
    "description"?: string
}

/**
 * Generate the flag selector.
 */
export function getFlags() {
    const flags: FlagSelector[] = [];
    for (const value of Object.values(Flags.types)) {
        flags.push({
            "value": value.key,
            "label": value.label,
            "description": value.description
        });
    }

    return flags;
}
