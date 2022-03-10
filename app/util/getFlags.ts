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

export function getFlags() {
    // Generate flag selector
    // TODO: Reflect changes in Environments#types
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
