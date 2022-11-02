import "dotenv/config";

/**
 * Available environment variables
 */
export interface Env {
    /**
     * URL of the website.
     */
    "WEBSITE_URL": string,

    /**
     * Database connection string.
     */
    "DATABASE_URL": string,

    /**
     * Secret to use to encrypt cookies.
     */
    "COOKIE_AUTH_SECRET": string,

    /**
     * Client ID for GitHub OAuth2.
     */
    "GITHUB_CLIENT_ID": string,

    /**
     * Secret for GitHub OAuth2.
     */
    "GITHUB_CLIENT_SECRET": string,

    /**
     * Client ID for PayPal.
     */
    "PAYPAL_CLIENT_ID": string,

    /**
     * Secret for PayPal.
     */
    "PAYPAL_SECRET": string,

    /**
     * IDs of accounts allowed to make modifications.
     */
    "ALLOWED_ACCOUNTS": string[],

    /**
     * Whether to disable account logins.
     */
    "DEV_MODE": boolean
}

/**
 * Get a key from the process env
 *
 * @param key Key to get
 */
export function getEnv<T extends keyof Env>(key: T): Env[T] | string | undefined;

/**
 * Get a key from the process env
 *
 * @param key Key to get
 * @param def Default value if not set
 */
export function getEnv<T extends keyof Env>(key: T, def: Env[T]): Env[T] | string;

/**
 * Get a key from the process env
 *
 * @param key Key to get
 * @param def Default value if not set
 * @param parse Function used to parse values
 */
export function getEnv<T extends keyof Env>(key: T, def: Env[T], parse?: (value: string | undefined) => Env[T]): Env[T] | string;

/**
 * Get a key from the process env
 *
 * @param key Key to get
 * @param def Default value if not set
 * @param parse Function used to parse values
 */
export function getEnv<T extends keyof Env>(key: T, def?: Env[T], parse?: (value: string | undefined) => Env[T]): Env[T] | string | undefined {
    let value: string | undefined | Env[T] = process.env[key] as string | undefined;

    if (parse) {
        value = parse(value);
    }

    return value ?? def;
}
