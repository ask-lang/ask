import { ReturnCode } from "as-contract-runtime";
import { instantiateRaw } from "as-serde-scale";

export class StorageResult<T> {
    constructor(
        public readonly code: ReturnCode = ReturnCode.Success,
        public readonly value: T = instantiateRaw<T>(),
    ) {}
}