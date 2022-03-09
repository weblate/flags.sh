import { BlitzConfig, sessionMiddleware, simpleRolesIsAuthorized } from "blitz";

const config: BlitzConfig = {
    "middleware": [
        sessionMiddleware({
            cookiePrefix: "flags_sh",
            isAuthorized: simpleRolesIsAuthorized,
        }),
    ],
    "webpack": config => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            "fs": false
        };

        return config;
    }
};

module.exports = config;
