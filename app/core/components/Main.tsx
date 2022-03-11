import { useEffect, useState } from "react";
import { EnvironmentTab } from "../../util/getEnvironments";
import { FlagSelector } from "../../util/getFlags";
import { Flags, FlagType } from "../../data/Flags";
import { Environments, EnvironmentType, getIcon } from "../../data/Environments";
import { ActionIcon, Center, Code, Group, Paper, Select, Switch, Text, TextInput, useMantineColorScheme } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { useNotifications } from "@mantine/notifications";
import { Prism } from "@mantine/prism";
import { InputCaption, Label, MarkedSlider, saveText, SelectDescription, SideBySide } from "@encode42/mantine-extras";
import { IconAlertCircle, IconArchive, IconClipboard, IconDownload, IconShare, IconTool } from "@tabler/icons";
import { useMutation } from "blitz";
import { getBaseUrl } from "nextjs-url";
import share from "../../mutations/share";
import { findEnvironment, findFlag } from "../../util/util";
import { PageTitle } from "./PageTitle";
import { FooterRow } from "./actionButton/FooterRow";
import { MemoryModal } from "./modal/MemoryModal";
import { FlagModal } from "./modal/FlagModal";

/**
 * Properties for the Main component.
 */
export interface MainProps {
    /**
     * The tabs to show as environments.
     */
    "environments": EnvironmentTab[],

    /**
     * The flags to show in the selector.
     */
    "flags": FlagSelector[],

    /**
     * The data utilized by shares.
     *
     * Defaults to {@see defaultData}
     */
    "data"?: typeof defaultData
}

/**
 * The default data utilized without share data.
 */
export const defaultData = {
    "filename": "server.jar",
    "memory": 4,
    "pterodactyl": false,
    "modernVectors": true,
    "gui": false,
    "autoRestart": false,
    "flags": Flags.default.key,
    "environment": Environments.default.key
};

/**
 * The main "control panel" of the site.
 */
export function Main({ data = defaultData, environments, flags }: MainProps) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === "dark";

    const notifications = useNotifications();
    const clipboard = useClipboard();
    const [shareMutation] = useMutation(share);

    // Options states
    const defaultFilename = data.filename;
    const [filename, setFileName] = useState<string>(defaultFilename);
    const [memory, setMemory] = useState<number>(data.memory);

    const [toggles, setToggles] = useState({
        "pterodactyl": data.pterodactyl,
        "modernVectors": data.modernVectors,
        "gui": data.gui,
        "autoRestart": data.autoRestart,
    });

    const [result, setResult] = useState<string>("Loading...");

    // Selector states
    const [activeTab, setActiveTab] = useState<number>(findEnvironment(data.environment).index);
    const [environment, setEnvironment] = useState<EnvironmentType>(findEnvironment(data.environment).result);
    const [selectedFlags, setSelectedFlags] = useState<FlagType>(findFlag(data.flags).result);
    const [invalidFilename, setInvalidFilename] = useState<boolean | string>(false);
    const [disabled, setDisabled] = useState({ ...selectedFlags.disabled, ...environment.disabled });

    // Modal states
    const [openMemoryModal, setOpenMemoryModal] = useState(false);
    const [openFlagModal, setOpenFlagModal] = useState(false);

    // The environment's toggles have changed
    useEffect(() => {
        if (!environment.requires) {
            return;
        }

        // Iterate each requirement
        for (const [key, value] of Object.entries(environment.requires)) {
            const newDisabled = disabled;

            // Iterate each exclusion
            for (const exclude of value.excludes) {
                // Disable toggles if required
                if (toggles[exclude]) {
                    newDisabled[key] = true;
                }
            }

            setDisabled(newDisabled);
        }
    }, [toggles, disabled, environment]);

    // Update the disabled components
    useEffect(() => {
        setDisabled({ ...selectedFlags.disabled, ...environment.disabled });
    }, [environment.disabled, selectedFlags.disabled]);

    // An option has been changed
    useEffect(() => {
        // Get the target memory
        let targetMem = memory;
        if (!disabled.pterodactyl && toggles.pterodactyl) {
            targetMem = (85 / 100) * targetMem;
        }

        // Create the script
        const flags = selectedFlags.result({
            "memory": targetMem,
            "filename": filename.replaceAll(/\s/g, "\\ "),
            "gui": !disabled.gui && toggles.gui,
            "pterodactyl": !disabled.pterodactyl && toggles.pterodactyl,
            "modernVectors": !disabled.modernVectors && toggles.modernVectors
        });
        const script = environment.result({ flags, "autoRestart": toggles.autoRestart });

        setResult(script);
    }, [filename, memory, toggles, selectedFlags, environment, disabled]);

    return (
        <>
            {/* The control center */}
            <Center sx={{
                "height": "100%"
            }}>
                <Paper padding="md" shadow="sm" withBorder sx={theme => ({
                    "width": "100%",
                    "backgroundColor": isDark ? theme.colors.dark[6] : theme.colors.gray[0]
                })}>
                    <Group direction="column" grow>
                        <PageTitle />
                        <Group grow sx={{
                            "alignItems": "flex-start"
                        }}>
                            {/* Left options */}
                            <Group direction="column" grow>
                                {/* Filename selector */}
                                <InputCaption text="The file used to launch the server. Located in the same directory as your configuration files.">
                                    <Label label="Filename">
                                        <TextInput defaultValue={defaultFilename} error={invalidFilename} icon={<IconArchive />} onChange={event => {
                                            const value = event.target.value;

                                            // Ensure the input is valid
                                            if (!value.includes(".jar")) {
                                                setInvalidFilename("Filename must end with .jar");
                                            } else {
                                                setInvalidFilename(false);
                                                setFileName(event.target.value);
                                            }
                                        }}/>
                                    </Label>
                                </InputCaption>

                                {/* Memory selector */}
                                <Label label="Memory" icon={
                                    <ActionIcon size="xs" variant="transparent" onClick={() => {
                                        setOpenMemoryModal(true);
                                    }}>
                                        <IconTool />
                                    </ActionIcon>
                                }>
                                    <MarkedSlider interval={4} step={0.5} min={0.5} max={24} value={memory} thumbLabel="Memory allocation slider" label={value => {
                                        return `${value.toFixed(1)} GB`;
                                    }} intervalLabel={value => {
                                        return `${value} GB`;
                                    }} onChange={value => {
                                        setMemory(value);
                                    }}/>
                                </Label>
                            </Group>

                            {/* Right options */}
                            <Group direction="column" grow>
                                {/* Flags selector */}
                                <Label label="Flags" icon={
                                    <ActionIcon size="xs" variant="transparent" onClick={() => {
                                        setOpenFlagModal(true);
                                    }}>
                                        <IconTool />
                                    </ActionIcon>
                                }>
                                    <Select value={selectedFlags.key} itemComponent={SelectDescription} styles={theme => ({
                                        "dropdown": {
                                            "background": isDark ? theme.colors.dark[8] : theme.colors.gray[0]
                                        }
                                    })} onChange={value => {
                                        if (!value) {
                                            return;
                                        }

                                        setSelectedFlags(findFlag(value).result ?? selectedFlags);
                                    }} data={flags} />
                                </Label>

                                {/* Misc toggles */}
                                <InputCaption text="Enables the server's GUI control panel. Automatically disabled in environments without a desktop.">
                                    <Switch label="GUI" checked={!disabled.gui && toggles.gui} disabled={disabled.gui} onChange={event => {
                                        setToggles({ ...toggles, "gui": event.target.checked });
                                    }} />
                                </InputCaption>
                                <InputCaption text={`Automatically restarts the server after it crashes or is stopped. Press CTRL + C to exit the script.`}>
                                    <Switch label="Auto-restart" checked={!disabled.autoRestart && toggles.autoRestart} disabled={disabled.autoRestart} onChange={event => {
                                        setToggles({ ...toggles, "autoRestart": event.target.checked });
                                    }} />
                                </InputCaption>
                            </Group>
                        </Group>

                        {/* Resulting flags */}
                        <Label label={<Text size="xl" weight={700}>Result</Text>}>
                            <Prism.Tabs active={activeTab} styles={theme => ({
                                "copy": {
                                    "backgroundColor": isDark ? theme.colors.dark[6] : theme.colors.gray[0],
                                    "borderRadius": theme.radius.xs
                                },
                                "line": {
                                    "whiteSpace": "pre-wrap"
                                }
                            })} onTabChange={active => {
                                const env = Environments.types[active];
                                if (!env) {
                                    return;
                                }

                                setActiveTab(active);
                                setEnvironment(env);
                            }}>
                                {environments.map(env => (
                                    <Prism.Tab key={env.key} label={env.label} icon={getIcon(env.icon)} withLineNumbers language="bash">
                                        {result}
                                    </Prism.Tab>
                                ))}
                            </Prism.Tabs>
                        </Label>

                        {/* Footer links */}
                        <SideBySide leftSide={
                            <Group noWrap>
                                {/* Download button */}
                                <ActionIcon color="green" variant="filled" size="lg" title="Download current script" disabled={disabled.download} onClick={() => {
                                    if (environment.file) {
                                        saveText(result, environment.file);
                                    }
                                }}>
                                    <IconDownload />
                                </ActionIcon>

                                <ActionIcon color="green" variant="filled" size="lg" onClick={async () => {
                                    // Create the share in DB
                                    const result = await shareMutation({
                                        filename,
                                        memory,
                                        "pterodactyl": toggles.pterodactyl,
                                        "modernVectors": toggles.modernVectors,
                                        "gui": toggles.gui,
                                        "autoRestart": toggles.autoRestart,
                                        "flags": selectedFlags.key,
                                        "environment": environment.key
                                    });

                                    // Copy to the clipboard
                                    clipboard.copy(`${getBaseUrl().href}${result.urlHash}`);

                                    // Display the copied notification
                                    notifications.showNotification({
                                        "disallowClose": true,
                                        "title": "Copied!",
                                        "message": "Use this URL to share the currently selected options.",
                                        "color": "green",
                                        "icon": <IconClipboard size={18} />
                                    });
                                }}>
                                    <IconShare />
                                </ActionIcon>

                                {/* Low memory alert */}
                                <Group spacing="xs" noWrap sx={{
                                    "display": memory < 4 ? "" : "none"
                                }}>
                                    <IconAlertCircle />
                                    <Text sx={{
                                        "whiteSpace": "pre-wrap"
                                    }}>It is recommended to allocate at least <Code>4 GB</Code> of memory.</Text>
                                </Group>
                            </Group>
                        } rightSide={
                            /* Misc links */
                            <FooterRow />
                        } />
                    </Group>
                </Paper>
            </Center>

            {/* Modals */}
            <MemoryModal open={{
                "value": openMemoryModal,
                "set": setOpenMemoryModal
            }} defaultMemory={{
                "value": memory,
                "set": setMemory
            }} defaultPterodactyl={{
                "value": !disabled.pterodactyl && toggles.pterodactyl,
                "set": value => {
                    setToggles({ ...toggles, "pterodactyl": value });
                },
                "disabled": disabled.pterodactyl ?? false
            }} />

            <FlagModal open={{
                "value": openFlagModal,
                "set": setOpenFlagModal
            }} defaultModernVectors={{
                "value": !disabled.modernVectors && toggles.modernVectors,
                "set": value => {
                    setToggles({ ...toggles, "modernVectors": value });
                },
                "disabled": disabled.modernVectors ?? false
            }} />

        </>
    );
}
