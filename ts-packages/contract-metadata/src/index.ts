export * from "./specs";
export * from "./types";
export * from "./layouts";
export * from "./api";

export const METADATA_VERSION = "0.1.0";

export interface ToMetadata {
    toMetadata(): unknown;
}
