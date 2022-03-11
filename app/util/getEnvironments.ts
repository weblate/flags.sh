import { EnvironmentIcon, Environments } from "../data/Environments";

/**
 * Data for a tab in the environments tabs.
 */
export interface EnvironmentTab {
    /**
     * Key of the entry.
     */
    "key": string,

    /**
     * Label of the entry.
     */
    "label": string,

    /**
     * Icon of the tab.
     */
    "icon": EnvironmentIcon
}

/**
 * Generate the environments selector.
 */
export function getEnvironments() {
    const environments: EnvironmentTab[] = [];
    for (const value of Environments.types) {
        environments.push({
            "key": value.key,
            "label": value.label,
            "icon": value.icon
        });
    }

    return environments;
}
