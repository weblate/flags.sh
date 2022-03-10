import { NotFoundError, resolver } from "blitz";
import db from "../../../../db";

export interface ShareOptions {
    "id"?: number
}

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
