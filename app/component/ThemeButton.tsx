import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons";

export function ThemeButton() {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <ActionIcon title={`Switch to ${isDark ? "light" : "dark"} mode`} size="xl" variant="gradient" gradient={isDark ? {
            "from": "yellow",
            "to": "orange",
            "deg": 120
        } : {
            "from": "indigo",
            "to": "violet",
            "deg": 120
        }} onClick={() => {
            toggleColorScheme();
        }}>
            {isDark ? <IconSun /> : <IconMoon />}
        </ActionIcon>
    );
}
