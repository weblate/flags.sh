import { Suspense } from "react";
import { useParam, useQuery } from "blitz";
import { LoadingOverlay } from "@mantine/core";
import { Layout } from "../../core/layout/Layout";
import { Main, MainProps } from "../../core/components/Main";
import getShare from "./queries/getShare";
import getOptions from "./queries/getOptions";
import { getEnvironments } from "../../util/getEnvironments";
import { getFlags } from "../../util/getFlags";

function Share({ environments, flags }: MainProps) {
    const urlHash = useParam("shareId", "string");

    const [share] = useQuery(getShare, {
        "urlHash": urlHash
    });

    const [options] = useQuery(getOptions, {
        "id": share.id
    });

    return (
        <Main environments={environments} flags={flags} data={{
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

function ShowShare({ environments, flags }: MainProps) {
    return (
        <Suspense fallback={<LoadingOverlay visible={true} />}>
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
