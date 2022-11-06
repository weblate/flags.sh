import { Center, Stack, Title, Text, Group, Button, Tabs, Container, ActionIcon, SimpleGrid, useMantineTheme, TextInput, Select, Checkbox, useMantineColorScheme, Code, SelectItem } from "@mantine/core";
import { MarkedSlider, ThemePaper } from "@encode42/mantine-extras";
import { IconArrowRight, IconBrandDiscord, IconBrandGithub, IconCopy, IconDownload, IconHomeQuestion, IconSettings, IconShare } from "@tabler/icons";
import { Badge } from "a/icon/Badge";
import { Prism } from "@mantine/prism";
import { ThemeButton } from "~/component/ThemeButton";
import { ReactNode, useMemo, useState } from "react";
import { AvailableOperatingSystem, AvailableServerType, config, ConfigType, environment, extraFlags, flags } from "~/data/options";
import { TablerIcon } from "~/component/TablerIcon";
import { Anchor } from "@encode42/remix-extras";
import { details } from "~/data/details";
import { StandardLayout } from "~/layout/StandardLayout";
import { useSetState } from "@mantine/hooks";
import { useForm } from "@mantine/form";

interface Tab {
    "value": string,
    "label": string
}

const tabs: Tab[] = [{
    "value": "environment",
    "label": "Environment"
}, {
    "value": "configuration",
    "label": "Configuration"
}, {
    "value": "result",
    "label": "Result"
}];

const code = `
#!/bin/bash

java -Xms4096M -Xmx4096M --add-modules=jdk.incubator.vector -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 -Dusing.aikars.flags=https://mcflags.emc.gs -Daikars.new.flags=true -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=20 -jar server.jar --nogui
`;

export default function SetupPage() {
    const theme = useMantineTheme();

    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === "dark";

    const [tab, setTab] = useState(tabs[0].value);
    const [operatingSystem, setOperatingSystem] = useState<AvailableOperatingSystem>(Object.keys(environment.operatingSystem)[0]);
    const [serverType, setServerType] = useState<AvailableServerType>(Object.keys(environment.serverType)[0]);

    const rows = useMemo(() => {
        const newRows: any[][] = []; // TODO

        for (const [key, value] of Object.entries(config)) {
            if (!newRows[value.row]) {
                newRows[value.row] = [];
            }

            newRows[value.row].push({
                "key": key,
                ...value
            });
        }

        return newRows;
    }, []);

    function createType(type: ConfigType, key: string) {
        let component: ReactNode;

        switch (type.component) {
            case "TextInput": {
                component = (
                    <TextInput icon={type.icon && <TablerIcon type={type.icon} />} {...type.props} {...form.getInputProps(key)} />
                );
                break;
            }
            case "Select": {
                component = (
                    <Select icon={type.icon && <TablerIcon type={type.icon} />} {...type.props} {...form.getInputProps(key)} />
                );
                break;
            }
            case "Slider": {
                component = (
                    <MarkedSlider {...type.props} {...form.getInputProps(key)} />
                );
                break;
            }
            case "Checkbox": {
                component = (
                    <Checkbox icon={type.icon && (({ className }) => <TablerIcon type={type.icon ?? "IconQuestionMark"} className={className} />)} {...type.props} {...form.getInputProps(key)} />
                );
                break;
            }
            case "Flags": {
                const type = environment.serverType[serverType];
                const availableFlags = type.flags;
                const availableExtraFlags = type.extraFlags ?? [];

                /**
                 * Magic algorithm written by melncat
                 *
                 * https://hastebin.com/icumolifex.js
                 */
                const combinations: string[] = (c => availableFlags.flatMap(y => c.map(x => [y, ...x])))(availableExtraFlags.reduce((l,c)=>l.concat(l.map(x=>x.concat(c))),[[]]));

                const displayedCombinations: SelectItem[] = [];
                for (const combination of combinations) {
                    const labels: string[] = combination.map(combinationValue => (flags[combinationValue] ?? extraFlags[combinationValue]).label);

                    displayedCombinations.push({
                        "value": combination.join("_"),
                        "label": labels.join(" + ")
                    });
                }

                component = (
                    <Select icon={<TablerIcon type="IconFlag" />} defaultValue={displayedCombinations[0].value} data={displayedCombinations} {...type.props} {...form.getInputProps(key)} />
                );
                break;
            }
        }

        return component;
    }

    const NextButton = () => {
        return (
            <Button variant="subtle" size="lg" rightIcon={<IconArrowRight />} onClick={() => {
                setTab(value => {
                    const currentIndex = tabs.findIndex(tab => value === tab.value);
                    const nextIndex = currentIndex + 1;

                    if (nextIndex >= tabs.length) {
                        return tabs[0].value;
                    }

                    return tabs[currentIndex + 1].value;
                });
            }}>
                Next
            </Button>
        );
    };

    const form = useForm({
        "initialValues": Object.fromEntries(Object.entries(config).map(([key, value]) => ([key, value.defaultValue])))
    });

    return (
        <StandardLayout>
            <Stack>
                <Tabs value={tab} color="green" orientation="vertical" styles={{
                    "tab": {
                        "height": theme.spacing.xl * 2.5
                    }
                }} onTabChange={value => {
                    if (!value) {
                        return;
                    }

                    setTab(value);
                }}>
                    <Tabs.List mr="md">
                        {tabs.map(tab => (
                            <Tabs.Tab key={tab.value} value={tab.value}>{tab.label}</Tabs.Tab>
                        ))}
                    </Tabs.List>
                    <Tabs.Panel value="environment">
                        <Stack spacing="xl">
                            <Stack>
                                <Stack spacing="xs">
                                    <Title order={3}>
                                        Operating System
                                    </Title>
                                    <Text color="dimmed" size="sm">The operating system that the server runs on. If you access your server though a website, you're likely using Pterodactyl</Text>
                                </Stack>
                                <SimpleGrid cols={2}>
                                    {Object.entries(environment.operatingSystem).map(([key, value]) => {
                                        const isSelected = operatingSystem === key;

                                        return (
                                            <Button key={key} leftIcon={<TablerIcon type={value.icon} />} variant={isSelected ? "gradient" : "outline"} gradient={{
                                                "from": "lime",
                                                "to": "green",
                                                "deg": 120
                                            }} onClick={() => {
                                                setOperatingSystem(key);
                                            }}>
                                                {value.label}
                                            </Button>
                                        );
                                    })}
                                </SimpleGrid>
                            </Stack>
                            <Stack>
                                <Stack spacing="xs">
                                    <Title order={3}>
                                        Server Type
                                    </Title>
                                    <Text color="dimmed" size="sm">The type of server software you're using. Typically, your server utilizes Paper or Purpur to handle connections and gameplay.</Text>
                                </Stack>
                                <SimpleGrid cols={2}>
                                    {Object.entries(environment.serverType).map(([key, value]) => {
                                        const isSelected = serverType === key;

                                        return (
                                            <Button key={key} leftIcon={<TablerIcon type={value.icon} />} variant={isSelected ? "gradient" : "outline"} gradient={{
                                                "from": "lime",
                                                "to": "green",
                                                "deg": 120
                                            }} onClick={() => {
                                                setServerType(key);
                                            }}>
                                                {value.label}
                                            </Button>
                                        );
                                    })}
                                </SimpleGrid>
                            </Stack>
                            <NextButton />
                        </Stack>
                    </Tabs.Panel>
                    <Tabs.Panel value="configuration">
                        <Stack spacing="xl">
                            {rows.map((row, i) => (
                                <SimpleGrid key={i} cols={Math.min(row.length, 3)}>
                                    {row.map(configOption => environment.operatingSystem[operatingSystem].config.includes(configOption.key) && environment.serverType[serverType].config.includes(configOption.key) ? (
                                        <Stack key={configOption.key}>
                                            <Stack spacing={0}>
                                                <Title order={3}>{configOption.label}</Title>
                                                <Text color="dimmed" size="sm">{configOption.description}</Text>
                                            </Stack>
                                            {createType(configOption.type, configOption.key)}
                                        </Stack>
                                    ) : false).filter(Boolean)}
                                </SimpleGrid>
                            ))}
                            <NextButton />
                        </Stack>
                    </Tabs.Panel>
                    <Tabs.Panel value="result">
                        <Stack>
                            <Stack>
                                <Stack spacing={0}>
                                    <Title order={3}>Script</Title>
                                    <Text color="dimmed" size="sm">The resulting script to start your server. Place this file in the same location as <Code>server.jar</Code>, then run it!</Text>
                                </Stack>
                                <Prism language="bash" withLineNumbers noCopy styles={{
                                    "line": {
                                        "whiteSpace": "pre-wrap"
                                    },
                                    "lineNumber": {
                                        "color": isDark ? theme.colors.dark[3] : theme.colors.gray[5]
                                    },
                                    "code": {
                                        "background": `${isDark ? theme.colors.dark[5] : theme.colors.gray[3]} !important`
                                    }
                                }}>
                                    {code}
                                </Prism>
                            </Stack>
                            <Group grow>
                                <Button leftIcon={<IconDownload />} variant="gradient" gradient={{
                                    "from": "lime",
                                    "to": "green",
                                    "deg": 120
                                }}>
                                    Download
                                </Button>
                                <Button leftIcon={<IconCopy />} variant="outline">
                                    Copy
                                </Button>
                                <Button leftIcon={<IconShare />} variant="outline">
                                    Share
                                </Button>
                            </Group>
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            </Stack>
        </StandardLayout>
    );
}
