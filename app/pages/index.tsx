import { ReactElement, useEffect, useState } from "react";
import { Center, Group, Paper, Text, TextInput, Switch, Code, ActionIcon, useMantineColorScheme, Select } from "@mantine/core";
import { InputCaption, Label, MarkedSlider, saveText, SelectDescription, SideBySide } from "@encode42/mantine-extras";
import { AlertCircle, Archive, Download, Tool } from "tabler-icons-react";
import { Prism } from "@mantine/prism";
import { Layout } from "../core/layout/Layout";
import { PageTitle } from "../core/components/PageTitle";
import { FooterRow } from "../core/components/actionButton/FooterRow";
import { FlagModal } from "../core/components/modal/FlagModal";
import { MemoryModal } from "../core/components/modal/MemoryModal";
import { Flags, FlagType } from "../data/Flags";
import { Environments, EnvironmentType } from "../data/Environments";

// TODO: API
// TODO: Share button
// TODO: Optimize page load (effects are firing very often)

// BUG: Changing memory slider then going to advanced options yields incorrect value
// BUG: Modern java toggle stays toggled while disabled

/**
 * Data for a flag in the selector.
 */
interface FlagSelector {
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
};

/**
 * The homepage of the site.
 */
function Home() {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === "dark";

    const defaultFilename = "server.jar";
    const [filename, setFileName] = useState<string>(defaultFilename);
    const [memory, setMemory] = useState<number>(4);

    const [toggles, setToggles] = useState({
        "gui": false,
        "autoRestart": false,
        "pterodactyl": false,
        "modernJava": true
    });

    const [result, setResult] = useState<string>("Loading...");

    const [environment, setEnvironment] = useState<EnvironmentType>(Environments.default);
    const [selectedFlags, setSelectedFlags] = useState<FlagType>(Flags.default);
    const [invalidFilename, setInvalidFilename] = useState<boolean | string>(false);

    const [flagSelector, setFlagSelector] = useState<FlagSelector[]>([]);
    const [environmentSelector, setEnvironmentSelector] = useState<ReactElement>();

    const [openMemoryModal, setOpenMemoryModal] = useState(false);
    const [openFlagModal, setOpenFlagModal] = useState(false);

    const [disabled, setDisabled] = useState({ ...selectedFlags.disabled, ...environment.disabled });

    // Generate the flags selector
    useEffect(() => {
        const flags: FlagSelector[] = [];

        for (const value of Object.values(Flags.types)) {
            flags.push({
                "value": value.key,
                "label": value.label,
                "description": value.description
            });
        }

        setFlagSelector(flags);
    }, []);

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
    }, [toggles, environment, disabled]);

    // Update the disabled components
    useEffect(() => {
        setDisabled({ ...selectedFlags.disabled, ...environment.disabled });
    }, [environment.disabled, selectedFlags.disabled]);

    // Generate the environments
    useEffect(() => {
        // TODO: This is quite unoptimized, fires every result change
        const environments: ReactElement[] = [];

        for (const [key, value] of Object.entries(Environments.types)) {
            environments.push(
                <Prism.Tab key={key} label={value.label} withLineNumbers scrollAreaComponent="div" language="bash" icon={value.icon}>
                    {result}
                </Prism.Tab>
            );
        }

        setEnvironmentSelector(
            <Prism.Tabs styles={theme => ({
                "copy": {
                    "backgroundColor": isDark ? theme.colors.dark[6] : theme.colors.gray[0],
                    "borderRadius": theme.radius.xs
                },
                "line": {
                    "whiteSpace": "pre-wrap"
                }
            })} onTabChange={active => {
                // Get the selected type from the tab
                const key = Object.keys(Environments.types)[active]; // TODO: This is unreliable, but tabKey does not work
                if (!key) {
                    return;
                }

                // Toggle the non-applicable components
                const env = Environments.types[key];
                if (!env) {
                    return;
                }

                setEnvironment(env);
            }}>
                {environments}
            </Prism.Tabs>
        );
    }, [isDark, result, setEnvironment]);

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
            "modernJava": !disabled.modernJava && toggles.modernJava
        });
        const script = environment.result({ flags, "autoRestart": toggles.autoRestart });

        setResult(script);
    }, [filename, memory, selectedFlags, toggles, environment, disabled]);

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
                        <Group grow>
                            {/* Left options */}
                            <Group direction="column" grow>
                                {/* Filename selector */}
                                <InputCaption text="The file used to launch the server. Located in the same directory as your configuration files.">
                                    <Label label="Filename">
                                        <TextInput defaultValue={defaultFilename} error={invalidFilename} icon={<Archive />} onChange={event => {
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
                                        <Tool />
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
                                        <Tool />
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

                                        setSelectedFlags(Flags.types[value] ?? selectedFlags);
                                    }} data={flagSelector} />
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
                            {environmentSelector}
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
                                    <Download />
                                </ActionIcon>

                                {/* Low memory alert */}
                                <Group spacing="xs" noWrap sx={{
                                    "display": memory < 4 ? "" : "none"
                                }}>
                                    <AlertCircle />
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
            }} defaultModernJava={{
                "value": !disabled.modernJava && toggles.modernJava,
                "set": value => {
                    setToggles({ ...toggles, "modernJava": value });
                },
                "disabled": disabled.modernJava ?? false
            }} />

        </>
    );
}

Home.getLayout = page => <Layout>{page}</Layout>;

export default Home;