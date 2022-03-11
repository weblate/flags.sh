import { resolver } from "blitz";
import db from "../../db";
import nid from "nid";

export interface ShareOptions {
    "filename": string,
    "memory": number,
    "pterodactyl": boolean,
    "modernVectors": boolean,
    "gui": boolean,
    "autoRestart": boolean,
    "flags": string,
    "environment": string
}

export default resolver.pipe(async ({
    filename,
    memory,
    pterodactyl,
    modernVectors,
    gui,
    autoRestart,
    flags,
    environment
}: ShareOptions) => {
    let urlHash;

    while (true) {
        urlHash = nid(5);

        if (!await db.share.findUnique({
            "where": {
                "urlHash": urlHash
            }
        })) {
            break;
        }
    }

    return db.share.create({
        "data": {
            urlHash,
            "options": {
                "create": {
                    filename,
                    memory,
                    pterodactyl,
                    modernVectors,
                    gui,
                    autoRestart,
                    flags,
                    environment
                }
            }
        }
    });
});
