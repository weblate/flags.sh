import { useEffect, useState } from "react";
import { Center, Group, Paper, Text, TextInput, Switch, Code, ActionIcon, useMantineColorScheme, Select } from "@mantine/core";
import { InputCaption, Label, MarkedSlider, saveText, SelectDescription, SideBySide } from "@encode42/mantine-extras";
import { IconAlertCircle, IconArchive, IconDownload, IconShare, IconTool } from "@tabler/icons";
import { Prism } from "@mantine/prism";
import { Layout } from "../core/layout/Layout";
import { PageTitle } from "../core/components/PageTitle";
import { FooterRow } from "../core/components/actionButton/FooterRow";
import { FlagModal } from "../core/components/modal/FlagModal";
import { MemoryModal } from "../core/components/modal/MemoryModal";
import { Flags, FlagType } from "../data/Flags";
import { Environments, EnvironmentType, getIcon } from "../data/Environments";
import { useMutation, useRouter } from "blitz";
import share from "../mutations/share";
import { EnvironmentTab, getEnvironments } from "../util/getEnvironments";
import { FlagSelector, getFlags } from "../util/getFlags";
import { findEnvironment } from "../util/util";

// TODO: API
// TODO: Share button
// TODO: i18n

// BUG: Java tab -> enable pterodactyl -> apply -> disable pterodactyl -> apply -> GUI will still be disabled

interface HomeProps {
    "data"?: typeof defaultData,
    "environments": EnvironmentTab[],
    "flags": FlagSelector[]
}

const defaultData = {
    "filename": "server.jar",
    "memory": 4,
    "pterodactyl": false,
    "modernVectors": true,
    "gui": false,
    "autoRestart": false,
    "flags": "aikars",
    "environment": "linux"
};

/**
 * The homepage of the site.
 */
function Home({ data = defaultData, environments, flags }: HomeProps) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === "dark";

    const router = useRouter();
    const [shareMutation] = useMutation(share);

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

    const [environment, setEnvironment] = useState<EnvironmentType>(findEnvironment(data.environment));
    const [selectedFlags, setSelectedFlags] = useState<FlagType>(Flags.default);
    const [invalidFilename, setInvalidFilename] = useState<boolean | string>(false);

    const [openMemoryModal, setOpenMemoryModal] = useState(false);
    const [openFlagModal, setOpenFlagModal] = useState(false);

    const [disabled, setDisabled] = useState({ ...selectedFlags.disabled, ...environment.disabled });

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

                                        setSelectedFlags(Flags.types[value] ?? selectedFlags);
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
                            <Prism.Tabs styles={theme => ({
                                "copy": {
                                    "backgroundColor": isDark ? theme.colors.dark[6] : theme.colors.gray[0],
                                    "borderRadius": theme.radius.xs
                                },
                                "line": {
                                    "whiteSpace": "pre-wrap"
                                }
                            })} onTabChange={active => {
                                const env = Environments.types[active]; // TODO: This is unreliable, but tabKey does not work
                                if (!env) {
                                    return;
                                }

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

                                    router.push({
                                        "pathname": `${router.pathname}/${result.urlHash}`
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

Home.getLayout = page => <Layout>{page}</Layout>;

export function getStaticProps() {
    return {
        "props": {
            "environments": getEnvironments(),
            "flags": getFlags()
        }
    };
}

export default Home;
