import { z } from "zod";
import { TablerIconsKeys, TablerIconsType } from "@encode42/tabler-icons-types";

export const IntID = z.number().min(0).max(65535);
export const StringID = z.string().max(50);

type TablerIconsArray = [TablerIconsType, ...TablerIconsType[]];
const TablerIconsEnum = z.enum<TablerIconsType, TablerIconsArray>(TablerIconsKeys as TablerIconsArray);

export const FetchIcon = TablerIconsEnum;
