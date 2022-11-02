import { TablerIconsType } from "@encode42/tabler-icons-types";
import SVG from "react-inlinesvg";
import { Loader } from "@mantine/core";
import { TablerIconProps as IconProps } from "@tabler/icons";

export interface TablerIconProps extends IconProps {
    "type": TablerIconsType
}

export function TablerIcon({ type, ...other }: TablerIconProps) {
    return (
        <SVG src={`/api/v1/icon/${type}`} loader={<Loader size="sm" />} {...other} />
    );
}
