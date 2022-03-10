import { NotFoundError, resolver } from "blitz";
import db from "../../../../db";

export interface ShareOptions {
    "urlHash": string
}

export default resolver.pipe(async ({ urlHash }) => {
    const share = await db.share.findFirst({
        "where": {
            urlHash
        }
    });

    if (!share) {
        throw new NotFoundError();
    }

    return share;
});
