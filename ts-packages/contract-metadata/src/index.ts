export * from "./specs";
export * from "./types";
export * from "./layouts";
export * from "./api";

/**
 * Versioned ask! project metadata.
 * # Note
 *
 * Represents the version of the serialized metadata *format*, which is distinct from the version
 * of this crate for Rust semantic versioning compatibility.
 */
export enum MetadataVersion {
    /// Version 0 placeholder. Represents the original non-versioned metadata format.
    V0,
    /// Version 1 of the contract metadata.
    V1,
    /// Version 2 of the contract metadata.
    V2,
    /// Version 3 of the contract metadata.
    V3,
}

export interface ToMetadata {
    toMetadata(): unknown;
}
