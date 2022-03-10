import { EnvironmentIcon, Environments } from "../data/Environments";

export interface EnvironmentTab {
    "key": string,
    "label": string,
    "icon": EnvironmentIcon
}

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
