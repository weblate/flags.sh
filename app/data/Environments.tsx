import { stripIndent } from "common-tags";
import { DisabledOptions } from "./interface/DisabledOptions";
import { ReactElement } from "react";
import { IconBrandDebian, IconBrandWindows, IconTerminal } from "@tabler/icons";
import { Keyed } from "../util/Keyed";

/**
 * The header used in Linux scripts/
 */
const linuxHeader = "#!/bin/bash";

/**
 * Options for the environment results.
 */
interface ResultOptions {
    "flags": string,
    "autoRestart": boolean
}

/**
 * Options for the component requires and excludes toggle.
 */
interface RequiresOptions {
    [key: string]: {
        /**
         * Whether to exclude this key if any of these toggles are enabled.
         */
        "excludes": string[]
    }
}

/**
 * The icon for an environment.
 */
export type EnvironmentIcon = "linux" | "windows" | "command";

/**
 * An environment type.
 */
export interface EnvironmentType extends Keyed {
    /**
     * The key utilized in the environment tab.
     */
    "key": string,

    /**
     * The label utilized in the environment tab.
     */
    "label": string,

    /**
     * The icon utilized in the environment tab.
     */
    "icon": EnvironmentIcon,

    /**
     * The name of the exported file.
     */
    "file"?: string,

    /**
     * The function used to get the results.
     */
    "result": ({ flags, autoRestart }: ResultOptions) => string,

    /**
     * Options for the disabled components.
     */
    "disabled": DisabledOptions,

    /**
     * Options for the component requires and excludes toggle.
     */
    "requires"?: RequiresOptions
}

/**
 * Interface for the Environments object.
 */
export interface EnvironmentsInterface {
    /**
     * The default environment.
     */
    "default": EnvironmentType,

    /**
     * Environment types.
     */
    "types": EnvironmentType[]
}

/**
 * The environments that are available to the app.
 */
export const Environments: EnvironmentsInterface = {
    get "default"() {
        return this.types[0];
    },
    "types": [{
        "key": "linux",
        "label": "Linux / Mac",
        "icon": "linux",
        "file": "start.sh",
        "result": ({ flags, autoRestart }) => {
            return stripIndent(!autoRestart ? `
                ${linuxHeader}

                ${flags}
            `: `
                ${linuxHeader}
                
                while [ true ]; do
                    ${flags}
                
                    echo Server restarting...
                    echo Press CTRL + C to stop.
                done
            `);
        },
        "disabled": {
            "pterodactyl": true
        }
    }, {
        "key": "windows",
        "label": "Windows",
        "icon": "windows",
        "file": "start.bat",
        "result": ({ flags, autoRestart }) => {
            return stripIndent(!autoRestart ? `
                ${flags}
            ` : `
                :start
                ${flags}
                
                echo Server restarting...
                echo Press CTRL + C to stop.
                goto :start
            `);
        },
        "disabled": {
            "pterodactyl": true
        }
    }, {
        "key": "java",
        "label": "Java",
        "icon": "command",
        "result": ({ flags }) => {
            return flags;
        },
        "disabled": {
            "pterodactyl": false,
            "autoRestart": true,
            "download": true
        },
        "requires": {
            "gui": {
                "excludes": ["pterodactyl"]
            }
        }
    }]
};

/**
 * Get an icon component from an EnvironmentIcon.
 *
 * @param icon EnvironmentIcon to get
 */
export function getIcon(icon: EnvironmentIcon): ReactElement {
    switch(icon) {
        case "linux":
            return <IconBrandDebian />;
        case "windows":
            return <IconBrandWindows />;
        case "command":
            return <IconTerminal />;
    }
}
