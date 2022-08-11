import * as metadata from "ask-contract-metadata";

export interface AskConfig {
    /**
     * If true, all warnings will be errors when transforming code.
     */
    readonly strict?: boolean;

    /**
     * Chain environment type related config.
     */
    readonly env?: EnvConfig;

    /**
     * Event related config.
     */
    readonly event?: EventConfig;

    /**
     * Contract related infos.
     */
    readonly metadataContract?: metadata.IContract;
}

/**
 * Supported env types this time.
 */
export enum EnvType {
    AccountId = "AccountId",
    Balance = "Balance",
    Timestamp = "Timestamp",
    BlockNumber = "BlockNumber",
}

/**
 * Chain environment type related config. Default is same with ink!.
 */
export interface EnvConfig {
    [EnvType.AccountId]?: string;
    [EnvType.Balance]?: string;
    [EnvType.Timestamp]?: string;
    [EnvType.BlockNumber]?: string;
}

/**
 * Event related config. Default to 4.
 */
export interface EventConfig {
    maxTopicNum?: number;
}

/**
 *
 * @returns return a default AskConfig
 */
export function defaultConfig(): AskConfig {
    return {
        // TODO: make sure the default config.
        strict: true,
        env: defaultEnvConfig(),
        event: defaultEventConfig(),
        metadataContract: new metadata.Contract("", "").toMetadata(),
    };
}

export function defaultEventConfig(): EventConfig {
    return {
        maxTopicNum: 4,
    };
}

export function defaultEnvConfig(): EnvConfig {
    return {
        AccountId: "__lang.AccountId",
        Balance: "__lang.Balance",
        Timestamp: "__lang.Timestamp",
        BlockNumber: "__lang.BlockNumber",
    };
}
