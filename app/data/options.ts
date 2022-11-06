import { TablerIconsType } from "@encode42/tabler-icons-types";

export type AvailableTypes = "TextInput" | "Select" | "Slider" | "Checkbox" | "Flags";

export type AvailableConfig = keyof typeof config;
export type AvailableFlags = keyof typeof flags;
export type AvailableExtraFlags = keyof typeof extraFlags;

export type AvailableOperatingSystem = keyof typeof environment.operatingSystem;
export type AvailableServerType = keyof typeof environment.serverType;

type SharedSupported = {
    [key in keyof Environment]: AvailableConfig[];
};

type SharedFlags = {
    [key: string]: (AvailableFlags | AvailableExtraFlags)[]
}

interface EnvironmentOptions<OptionType = EnvironmentOption> {
    [key: string]: OptionType
}

interface EnvironmentOption {
    "label": string,
    "icon": TablerIconsType,
    "config": AvailableConfig[]
}

interface ServerTypeOption extends EnvironmentOption {
    "flags": AvailableFlags[],
    "extraFlags"?: AvailableExtraFlags[]
}

export interface ConfigType {
    "component": AvailableTypes,
    "icon"?: TablerIconsType,
    "props"?: any
}

type Environment = {
    "operatingSystem": EnvironmentOptions,
    "serverType": EnvironmentOptions<ServerTypeOption>
}

interface Config {
    [key: string]: {
        "label": string,
        "description"?: string,
        "isAdvanced"?: boolean,
        "row": number,
        "type": ConfigType
    }
}

interface FlagOption {
    "label": string,
    "description"?: string
}

interface FlagExtraOption extends FlagOption {
    "supports": AvailableFlags[]
}

interface Flags {
    [key: string]: FlagOption
}

interface ExtraFlags {
    [key: string]: FlagExtraOption
}

const sharedSupported: SharedSupported = {
    "operatingSystem": ["filename", "flags", "memory"],
    "serverType": ["filename", "flags", "memory", "autorestart", "variables"]
};

const sharedFlags: SharedFlags = {
    "bukkit": ["none", "aikars"],
    "proxy": ["none", "proxy"]
};

export const environment: Environment = {
    "operatingSystem": {
        "linux": {
            "label": "Linux",
            "icon": "IconBrandDebian",
            "config": [
                ...sharedSupported.operatingSystem,
                "gui",
                "autorestart",
                "variables"
            ]
        },
        "windows": {
            "label": "Windows",
            "icon": "IconBrandWindows",
            "config": [
                ...sharedSupported.operatingSystem,
                "gui",
                "autorestart",
                "variables"
            ]
        },
        "pterodactyl": {
            "label": "Pterodactyl",
            "icon": "IconServer",
            "config": [
                ...sharedSupported.operatingSystem,
            ]
        },
        "command": {
            "label": "Command",
            "icon": "IconTerminal",
            "config": [
                ...sharedSupported.operatingSystem,
            ]
        }
    },
    "serverType": {
        "paper": {
            "label": "Paper",
            "icon": "IconBucket",
            "flags": [
                ...sharedFlags.bukkit
            ],
            "config": [
                ...sharedSupported.serverType,
                "gui"
            ]
        },
        "purpur": {
            "label": "Purpur",
            "icon": "IconBucket",
            "flags": [
                ...sharedFlags.bukkit
            ],
            "extraFlags": [
                "vectors"
            ],
            "config": [
                ...sharedSupported.serverType,
                "gui"
            ]
        },
        "waterfall": {
            "label": "Waterfall",
            "icon": "IconNetwork",
            "flags": [
                ...sharedFlags.proxy
            ],
            "config": [
                ...sharedSupported.serverType
            ]
        },
        "velocity": {
            "label": "Velocity",
            "icon": "IconNetwork",
            "flags": [
                ...sharedFlags.proxy
            ],
            "config": [
                ...sharedSupported.serverType
            ]
        }
    }
};

export const config: Config = {
    "filename": {
        "label": "File name",
        "description": "The name of the file that will be used to start your server.",
        "row": 0,
        "type": {
            "component": "TextInput",
            "icon": "IconFile"
        }
    },
    "flags": {
        "label": "Flags",
        "description": "The collection of start arguments that typically optimize the server's performance.",
        "row": 0,
        "type": {
            "component": "Flags",
            "icon": "IconFlag"
        }
    },
    "memory": {
        "label": "Memory",
        "description": "The amount of memory (RAM) to allocate to your server. Values below <Code>4 GB</Code> and above <Code>12 GB</Code> aren't recommended.",
        "row": 1,
        "type": {
            "component": "Slider",
            "props": {
                "interval": 4,
                "step": 0.5,
                "min": 0.5,
                "max": 20,
                "hoverLabel": value => {
                    return `${value.toFixed(1)} GB`;
                },
                "intervalLabel": value => {
                    return `${value} GB`;
                }
            }
        }
    },
    "gui": {
        "label": "GUI",
        "description": "Whether to display the built-in management GUI.",
        "row": 2,
        "type": {
            "component": "Checkbox",
            "icon": "IconAppWindow",
            "props": {
                "label": "Enable GUI"
            }
        }
    },
    "autorestart": {
        "label": "Auto-restart",
        "description": "Whether to automatically restart after crash.",
        "row": 2,
        "type": {
            "component": "Checkbox",
            "icon": "IconRefresh",
            "props": {
                "label": "Enable auto-restart"
            }
        }
    },
    "variables": {
        "label": "Use variables",
        "description": "Whether to use script variables for common elements.",
        "row": 2,
        "isAdvanced": true,
        "type": {
            "component": "Checkbox",
            "icon": "IconCode",
            "props": {
                "label": "Use variables"
            }
        }
    }
};

export const flags: Flags = {
    "none": {
        "label": "None"
    },
    "aikars": {
        "label": "Aikar's Flags",
        "description": "The cool"
    },
    "proxy": {
        "label": "Proxy",
        "description": "Generic flags that work on all proxy servers."
    }
};

export const extraFlags: ExtraFlags = {
    "vectors": {
        "label": "Modern vectors",
        "description": "Enables SIMD operations to optimize map item rendering.",
        "supports": ["aikars"]
    }
};
