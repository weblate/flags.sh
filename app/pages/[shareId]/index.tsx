import Home from "../index";
import { getEnvironments } from "../../util/getEnvironments";
import { getFlags } from "../../util/getFlags";
import { useParam, useQuery } from "blitz";
import getShare from "./queries/getShare";
import { Suspense } from "react";
import getOptions from "./queries/getOptions";
import { Layout } from "../../core/layout/Layout";

function Share({ environments, flags }) {
    const urlHash = useParam("shareId", "string");

    const [share] = useQuery(getShare, {
        "urlHash": urlHash
    });

    const [options] = useQuery(getOptions, {
        "id": share.id
    });

    return (
        <Home environments={environments} flags={flags} data={{
            "filename": options.filename,
            "memory": options.memory,
            "pterodactyl": options.pterodactyl,
            "modernVectors": options.modernVectors,
            "gui": options.gui,
            "autoRestart": options.autoRestart,
            "flags": options.flags,
            "environment": options.environment
        }} />
    );
}

function ShowShare({ environments, flags }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Share environments={environments} flags={flags} />
        </Suspense>
    );
}

ShowShare.getLayout = page => <Layout>{page}</Layout>;

export default ShowShare;

export function getServerSideProps() {
    return {
        "props": {
            "environments": getEnvironments(),
            "flags": getFlags()
        }
    };
}
