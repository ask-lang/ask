import { ReturnCode } from "ask-contract-runtime";
import { instantiateRaw } from "as-serde-scale";

/**
 * A class represents the value returned from `getContractStorageResult`.
 */
export class StorageResult<T> {
    constructor(
        /**
         * The return code of this call.
         */
        public readonly code: ReturnCode = ReturnCode.Success,
        /**
         * The value read from env storage.
         */
        public readonly value: T = instantiateRaw<T>(),
    ) {}
}
