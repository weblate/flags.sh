import { resolver } from "blitz";
import db from "../../db";
import nid from "nid";

/**
 * Options for a share.
 */
export interface ShareOptions {
    /**
     * Filename utilized.
     */
    "filename": string,

    /**
     * Amount of memory utilized.
     */
    "memory": number,

    /**
     * Whether to enable Pterodactyl optimizations.
     */
    "pterodactyl": boolean,

    /**
     * Whether to enable modern Java vectors.
     */
    "modernVectors": boolean,

    /**
     * Whether to enable the GUI.
     */
    "gui": boolean,

    /**
     * Whether to enable the auto-restart script.
     */
    "autoRestart": boolean,

    /**
     * Selected flags.
     *
     * TODO: Make type strict
     */
    "flags": string,

    /**
     * Selected environment.
     *
     * TODO: Make type strict
     */
    "environment": string
}

// TODO: Input validation

/**
 * Create a share entry in the database.
 */
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
    // Generate a unique share hash
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

    // Push to the DB
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
