import { NotFoundError, resolver } from "blitz";
import db from "../../../../db";

/**
 * Options for the getShare query.
 */
export interface ShareOptions {
    /**
     * The hash of the share.
     */
    "urlHash": string
}

/**
 * Query the database for a share.
 */
export default resolver.pipe(async ({ urlHash }) => {
    const share = await db.share.findUnique({
        "where": {
            urlHash
        }
    });

    if (!share) {
        throw new NotFoundError();
    }

    return share;
});
