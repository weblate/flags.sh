import { z, ZodTypeAny } from "zod";
import { AvailableConfig, AvailableExtraFlags, AvailableFlags, extraFlags, flags } from "~/data/options";

const flagsKeys = Object.keys(flags);

type AvailableFlagsArray = [AvailableFlags, ...AvailableFlags[]];
const AvailableFlagsEnum = z.enum<AvailableFlags, AvailableFlagsArray>(flagsKeys as AvailableFlagsArray);

type AvailableExtraFlagsArray = [AvailableExtraFlags, ...AvailableExtraFlags[]];
const AvailableExtraFlagsEnum = z.enum<AvailableExtraFlags, AvailableExtraFlagsArray>(Object.keys(extraFlags) as AvailableExtraFlagsArray);

type OptionsValidation = {
    [key in (AvailableConfig | "extraFlags")]: ZodTypeAny
}

export const Options = z.object({
    "filename": z.string().max(25).default("server.jar"),
    "flags": AvailableFlagsEnum.default(flagsKeys[0]),
    "extraFlags": z.array(AvailableExtraFlagsEnum).max(5).default([]),
    "memory": z.number().min(0.5).max(20).default(4),
    "gui": z.boolean().default(false),
    "autorestart": z.boolean().default(false),
    "variable": z.boolean().default(false)
} as OptionsValidation).default({});
