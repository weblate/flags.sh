import { RouteParams } from "@encode42/remix-extras";
import { json } from "@remix-run/node";
import { FetchIcon } from "~/util/validation/validation";
import fs from "fs/promises";
import * as tablerIcons from "@tabler/icons";

export async function loader({ params }: RouteParams) {
    if (!params.type) {
        return json({
            "error": "Icon type is undefined"
        }, {
            "status": 400
        });
    }

    const validation = FetchIcon.safeParse(params.type);
    if (!validation.success) {
        return json({
            "error": validation.error
        }, {
            "status": 400
        });
    }

    // eslint-disable-next-line import/namespace
    const icon = tablerIcons[validation.data];
    const iconName = icon.toString().match(/icon-tabler-(.*?)"/);

    return new Response(await fs.readFile(`node_modules/@tabler/icons/icons/${iconName?.[1]}.svg`), {
        "status": 200,
        "headers": {
            "Content-Type": "image/svg+xml",
            "Content-Disposition": `attachment; filename="${validation.data}.svg"`
        }
    });
}
