import type { AvailableConfig } from "~/data/config";
import type { AvailableFlags, AvailableExtraFlags } from "~/data/flags";
import { component$, Resource, useResource$, useStore, useTask$ } from "@builder.io/qwik";
import { operatingSystem } from "~/data/environment/operatingSystem";
import { serverType } from "~/data/environment/serverType";
import { config, getDefaults } from "~/data/config";
import { $translate as t, Speak } from "qwik-speak";
import { ChangeLocale } from "~/component/change-locale/change-locale";
import { ChangeColorScheme } from "~/component/change-color-scheme/change-color-scheme";
import Layout from "~/route/[...lang]/layout";
import { FileName } from "~/component/config/file-name/file-name";
import { Flags } from "~/component/config/flags/flags";
import { Memory } from "~/component/config/memory/memory";
import { Gui } from "~/component/config/gui/gui";
import { AutoRestart } from "~/component/config/auto-restart/auto-restart";
import { ExtraFlags } from "~/component/config/extra-flags/extra-flags";
import { Variables } from "~/component/config/variables/variables";
import { Config } from "~/component/config/config/config";
import { extraFlags } from "~/data/flags";

interface State {
    "availableConfig": AvailableConfig[],
    "availableFlags": AvailableFlags[],
    "availableExtraFlags": AvailableExtraFlags[],
    "advanced": boolean
}

type SetConfigState = {
    [key in AvailableConfig]: any
}

export default component$(() => {
    const state = useStore<State>({
        "advanced": false,
        "availableConfig": [],
        "availableFlags": [],
        "availableExtraFlags": [],
        "generate": false // hacky workaround
    });

    const setConfig = useStore<SetConfigState>(getDefaults());

    const generate = useResource$<string>(async ({ track, cleanup }) => {
        track(() => state.generate); // hacky workaround
        const selectedConfig = track(() => setConfig);

        const abortController = new AbortController();
        cleanup(() => {
            abortController.abort("cleanup");
        });

        const url = new URL("/api/v1/generate", import.meta.env.DEV ? "http://localhost:5173" : "https://flags-sh.pages.dev"); // hacky workaround
        for (const [key, value] of Object.entries(selectedConfig)) {
            if (key !== "operatingSystem" && key !== "serverType" && !state.availableConfig.includes(key)) {
                continue;
            }

            url.searchParams.set(key, JSON.stringify(value));
        }

        const response = await fetch(url.href, {
            "signal": abortController.signal
        });

        const data = await response.json();
        return data.result;
    });

    useTask$(({ track }) => {
        const setOperatingSystem = track(() => setConfig.operatingSystem);
        const setServerType = track(() => setConfig.serverType);
        const setAdvanced = track(() => state.advanced);

        const selectedOperatingSystem = operatingSystem[setOperatingSystem];
        const selectedServerType = serverType[setServerType];

        const availableConfig: AvailableConfig[] = [];
        for (const [key, value] of Object.entries(config)) {
            if (!selectedOperatingSystem.config.includes(key) || !selectedServerType.config.includes(key)) {
                continue;
            }

            if (value.isAdvanced && !setAdvanced) {
                continue;
            }

            availableConfig.push(key);
        }

        state.availableConfig = availableConfig;
        state.availableFlags = selectedServerType.flags;
        setConfig.flags = selectedServerType.default.flags;
        setConfig.extraFlags = selectedServerType.default.extraFlags;
    });

    useTask$(({ track }) => {
        const setFlags = track(() => setConfig.flags);
        const setServerType = track(() => setConfig.serverType);
        const selectedServerType = serverType[setServerType];

        const availableExtraFlags: AvailableExtraFlags[] = [];
        for (const [key, value] of Object.entries(extraFlags)) {
            if (!value.supports.includes(setFlags) || !selectedServerType.extraFlags?.includes(key)) {
                continue;
            }

            availableExtraFlags.push(key);
        }

        state.availableExtraFlags = availableExtraFlags;
    });

    return (
        <Speak assets={["panel"]}>
            <Layout>
                <div>
                    <h1>flags.sh</h1>
                    <h3>{t("app.description")}</h3>
                </div>
                <div>
                    <div>
                        <h2>{t("panel.environment.label")}</h2>
                        <Config label={t("panel.operatingSystem.label")} description={t("panel.operatingSystem.description")}>
                            <select class="select select-bordered" onChange$={event => {
                                setConfig.operatingSystem = event.target.value;
                            }}>
                                {Object.keys(operatingSystem).map(key => (
                                    <option key={key} value={key}>{t(`panel.operatingSystem.${key}`)}</option>
                                ))}
                            </select>
                        </Config>
                        <Config label={t("panel.serverType.label")} description={t("panel.serverType.description")}>
                            <select class="select select-bordered" onChange$={event => {
                                setConfig.serverType = event.target.value;
                            }}>
                                {Object.keys(serverType).map(key => (
                                    <option key={key} value={key}>{t(`panel.serverType.${key}`)}</option>
                                ))}
                            </select>
                        </Config>
                    </div>
                    <div>
                        <h2>{t("panel.config.label")}</h2>
                        <div>
                            <FileName value={setConfig.fileName} onChange$={event => {
                                setConfig.fileName = event.target.value;
                            }} />
                            <Memory value={setConfig.memory} onChange$={event => {
                                setConfig.memory = Number.parseInt(event.target.value);
                            }} />
                        </div>
                        <div>
                            <Flags value={setConfig.flags} availableFlags={state.availableFlags} onChange$={event => {
                                if (!event.target.value) {
                                    return;
                                }

                                setConfig.flags = event.target.value;
                            }} />
                            <ExtraFlags value={setConfig.extraFlags} visible={state.availableExtraFlags.length > 0} availableExtraFlags={state.availableExtraFlags} onChange$={event => {
                                if (!event.target.value) {
                                    return;
                                }

                                setConfig.extraFlags = event.target.value;
                            }} />
                        </div>
                        <div>
                            <Gui visible={state.availableConfig.includes("gui")} value={setConfig.gui} onChange$={event => {
                                setConfig.gui = event.target.checked;
                            }} />
                            <AutoRestart visible={state.availableConfig.includes("autoRestart")} value={setConfig.autoRestart} onChange$={event => {
                                setConfig.autoRestart = event.target.checked;
                            }} />
                            <Variables visible={state.availableConfig.includes("variables")} value={setConfig.autoRestart} onChange$={event => {
                                setConfig.variables = event.target.checked;
                            }} />
                        </div>
                    </div>
                    <div>
                        <h2>{t("panel.script.label")}</h2>
                        <div class="mockup-code">
                            <Resource value={generate} onResolved={result => <pre>{result}</pre>} />
                        </div>
                        <button class="btn btn-primary" onClick$={() => {
                            state.generate = !state.generate; // hacky workaround
                        }}>
                            Generate
                        </button>
                    </div>
                </div>
                <div>
                    <button class="btn btn-outline" onClick$={() => {
                        state.advanced = !state.advanced;
                    }}>
                        {t("panel.advanced")}
                    </button>
                </div>
                <div>
                    <ChangeColorScheme />
                    <ChangeLocale />
                </div>
            </Layout>
        </Speak>
    );
});
