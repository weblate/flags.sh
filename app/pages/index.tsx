import { Layout } from "../core/layout/Layout";
import { Main, MainProps } from "../core/components/Main";
import { getEnvironments } from "../util/getEnvironments";
import { getFlags } from "../util/getFlags";

// TODO: API
// TODO: i18n
// TODO: Server-side colorScheme

// BUG: Java tab -> enable pterodactyl -> apply -> disable pterodactyl -> apply -> GUI will still be disabled

/**
 * The homepage of the site.
 */
function Home({ environments, flags }: MainProps) {
    return (
        <>
            <Main environments={environments} flags={flags} />
        </>
    );
}

Home.getLayout = page => <Layout>{page}</Layout>;

export function getStaticProps() {
    return {
        "props": {
            "environments": getEnvironments(),
            "flags": getFlags()
        }
    };
}

export default Home;
