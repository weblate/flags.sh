import { NotFoundError, resolver } from "blitz";
import db from "../../../../db";

/**
 * Options for the getOptions query.
 */
export interface ShareOptions {
    /**
     * ID of the attached share.
     */
    "id"?: number
}

/**
 * Query the database for share options.
 */
export default resolver.pipe(async ({ id }) => {
    const share = await db.options.findFirst({
        "where": {
            "shareId": id
        }
    });

    if (!share) {
        throw new NotFoundError();
    }

    return share;
});
