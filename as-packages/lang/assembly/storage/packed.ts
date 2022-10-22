import { i128, u128 } from "as-bignum";
import { PackedLayout, IKey } from "../interfaces";
import { env } from "../env";
import { FixedArray } from "../fixedArrays";
import { ReturnCode } from "ask-contract-runtime";
import { StorageResult } from "../types";

/**
 * Pulls an instance of type `T` from the contract storage using packed layout.
 *
 * The root key denotes the offset into the contract storage where the
 * instance of type `T` is being pulled from.
 *
 * # Note
 *
 * - The routine assumes that the instance has previously been stored to
 * the contract storage using packed layout.
 * - Users should prefer using this function directly instead of using the
 * methods on [`PackedLayout`].
 * @param key
 * @returns
 */
export function pullPackedRoot<T extends PackedLayout, K extends IKey>(key: K): T {
    const value: T = env().getContractStorage<K, T>(key);
    pullPacked<T, K>(value, key);
    return value;
}

/**
 * Clears the entity from the contract storage using spread layout.
 *
 * The root key denotes the offset into the contract storage where the
 * instance of type `T` is being cleared from.
 * @param value
 * @param key
 * @returns
 */
export function clearPackedRoot<T extends PackedLayout, K extends IKey>(value: T, key: K): T {
    clearPacked(value, key);
    env().clearContractStroage<K>(key);
    return value;
}

/**
 * Pulls an instance of type `T` from the contract storage using packed layout.
 *
 * The root key denotes the offset into the contract storage where the
 * instance of type `T` is being pulled from.
 *
 * # Note
 *
 * - The routine assumes that the instance has previously been stored to
 * the contract storage using packed layout.
 * - Users should prefer using this function directly instead of using the
 * methods on [`PackedLayout`].
 * @param key
 * @returns
 */
export function pullPackedRootResult<T extends PackedLayout, K extends IKey>(
    key: K,
): StorageResult<T> {
    const value = env().getContractStorageResult<K, T>(key);
    if (value.code == ReturnCode.Success) {
        pullPacked<T, K>(value.value, key);
    }
    return value;
}

/**
 * Pushes the entity to the contract storage using packed layout.
 *
 * The root key denotes the offset into the contract storage where the
 * instance of type `T` is being pushed to.
 *
 * # Note
 *
 * - The routine will push the given entity to the contract storage using
 * packed layout.
 * - Users should prefer using this function directly instead of using the
 * trait methods on [`PackedLayout`].
 * @param value
 * @param key
 */
export function pushPackedRoot<T extends PackedLayout, K extends IKey>(value: T, key: K): void {
    pushPacked<T, K>(value, key);
    // @ts-ignore
    env().setContractStorage<K, T>(key, value);
}

// TODO: maybe we don't need to call recursively for packedLayout.
// Note: it's recursive by calling `value.pullPacked(key)`.
export function pullPacked<T, K extends IKey>(value: T, key: K): void {
    let dummy: T;
    if (!isReference<T>()) {
        return;
    } else if (
        isString<T>() ||
        idof<T>() == idof<i128>() ||
        idof<T>() == idof<u128>() ||
        idof<T>() == idof<Error>() ||
        idof<T>() == idof<SyntaxError>() ||
        idof<T>() == idof<RangeError>() ||
        idof<T>() == idof<TypeError>() ||
        idof<T>() == idof<URIError>() ||
        idof<T>() == idof<TypeError>() ||
        idof<T>() == idof<ArrayBuffer>() ||
        idof<T>() == idof<Int8Array>() ||
        idof<T>() == idof<Int16Array>() ||
        idof<T>() == idof<Int32Array>() ||
        idof<T>() == idof<Int64Array>() ||
        idof<T>() == idof<Uint8Array>() ||
        idof<T>() == idof<Uint16Array>() ||
        idof<T>() == idof<Uint32Array>() ||
        idof<T>() == idof<Uint64Array>() ||
        false
    ) {
        return;
    } else if (isArray<T>() || value instanceof StaticArray || isArrayLike<T>() || false) {
        // @ts-ignore
        for (let i = 0; i < value.length; ++i) {
            // @ts-ignore
            pullPacked<valueof<T>, K>(value[i], key);
        }
    } else if (value instanceof FixedArray) {
        // @ts-ignore
        for (let i = 0, len = value.length; i < len; ++i) {
            // @ts-ignore
            pullPacked<valueof<T>, K>(value[i], key);
        }
    }
    // @ts-ignore
    else if (dummy instanceof Set) {
        // @ts-ignore
        const values = value.values();
        for (let i = 0; i < values.length; ++i) {
            // @ts-ignore
            pullPacked<indexof<T>, K>(values[i], key);
        }
    }
    // @ts-ignore
    else if (dummy instanceof Map) {
        // @ts-ignore
        const keys = value.keys();
        for (let i = 0; i < keys.length; ++i) {
            // @ts-ignore
            pullPacked<indexof<T>, K>(keys[i], key);
            // @ts-ignore
            pullPacked<valueof<T>, K>(value.get(keys[i]), key);
        }
    } else {
        // @ts-ignore
        value.pullPacked(key);
    }
}

// TODO: maybe we don't need to call recursively for packedLayout.
// Note: it's recursive by calling `value.pushPacked(key)`.
export function pushPacked<T, K extends IKey>(value: T, key: K): void {
    if (!isReference<T>()) {
        return;
    } else if (
        isString<T>() ||
        idof<T>() == idof<i128>() ||
        idof<T>() == idof<u128>() ||
        idof<T>() == idof<Error>() ||
        idof<T>() == idof<SyntaxError>() ||
        idof<T>() == idof<RangeError>() ||
        idof<T>() == idof<TypeError>() ||
        idof<T>() == idof<URIError>() ||
        idof<T>() == idof<TypeError>() ||
        idof<T>() == idof<ArrayBuffer>() ||
        idof<T>() == idof<Int8Array>() ||
        idof<T>() == idof<Int16Array>() ||
        idof<T>() == idof<Int32Array>() ||
        idof<T>() == idof<Int64Array>() ||
        idof<T>() == idof<Uint8Array>() ||
        idof<T>() == idof<Uint16Array>() ||
        idof<T>() == idof<Uint32Array>() ||
        idof<T>() == idof<Uint64Array>() ||
        false
    ) {
        return;
    } else if (isArray<T>() || value instanceof StaticArray || isArrayLike<T>() || false) {
        // @ts-ignore
        for (let i = 0; i < value.length; ++i) {
            // @ts-ignore
            if (isReference<valueof<T>>()) {
                // @ts-ignore
                pushPacked<valueof<T>, K>(value[i], key);
            }
        }
    } else if (value instanceof FixedArray) {
        // @ts-ignore
        for (let i = 0, len = value.length; i < len; ++i) {
            // @ts-ignore
            pushPacked<valueof<T>, K>(value[i], key);
        }
    }
    // @ts-ignore
    else if (value instanceof Set) {
        // @ts-ignore
        const values = value.values();
        for (let i = 0; i < values.length; ++i) {
            // @ts-ignore
            if (isReference<indexof<T>>()) {
                // @ts-ignore
                pushPacked<indexof<T>, K>(values[i], key);
            }
        }
    }
    // @ts-ignore
    else if (value instanceof Map) {
        // @ts-ignore
        const keys = value.keys();
        for (let i = 0; i < keys.length; ++i) {
            // @ts-ignore
            if (isReference<indexof<T>>()) {
                // @ts-ignore
                pushPacked<indexof<T>, K>(keys[i], key);
            }
            // @ts-ignore
            if (isReference<valueof<T>>()) {
                // @ts-ignore
                pushPacked<valueof<T>, K>(value.get(keys[i]), key);
            }
        }
    } else {
        // @ts-ignore
        value.pushPacked(key);
    }
}

// TODO: maybe we don't need to call recursively for packedLayout.
// Note: it's recursive by calling `value.pullPacked(key)`.
export function clearPacked<T, K extends IKey>(value: T, key: K): void {
    if (!isReference<T>()) {
        return;
    } else if (
        isString<T>() ||
        idof<T>() == idof<i128>() ||
        idof<T>() == idof<u128>() ||
        idof<T>() == idof<Error>() ||
        idof<T>() == idof<SyntaxError>() ||
        idof<T>() == idof<RangeError>() ||
        idof<T>() == idof<TypeError>() ||
        idof<T>() == idof<URIError>() ||
        idof<T>() == idof<TypeError>() ||
        idof<T>() == idof<ArrayBuffer>() ||
        idof<T>() == idof<Int8Array>() ||
        idof<T>() == idof<Int16Array>() ||
        idof<T>() == idof<Int32Array>() ||
        idof<T>() == idof<Int64Array>() ||
        idof<T>() == idof<Uint8Array>() ||
        idof<T>() == idof<Uint16Array>() ||
        idof<T>() == idof<Uint32Array>() ||
        idof<T>() == idof<Uint64Array>() ||
        false
    ) {
        return;
    } else if (isArray<T>() || value instanceof StaticArray || isArrayLike<T>() || false) {
        // @ts-ignore
        for (let i = 0; i < value.length; ++i) {
            // @ts-ignore
            clearPacked<valueof<T>, K>(value[i], key);
        }
    } else if (value instanceof FixedArray) {
        // @ts-ignore
        for (let i = 0, len = value.length; i < len; ++i) {
            // @ts-ignore
            clearPacked<valueof<T>, K>(value[i], key);
        }
    }
    // @ts-ignore
    else if (value instanceof Set) {
        // @ts-ignore
        const values = value.values();
        for (let i = 0; i < values.length; ++i) {
            // @ts-ignore
            clearPacked<indexof<T>, K>(values[i], key);
        }
    }
    // @ts-ignore
    else if (value instanceof Map) {
        // @ts-ignore
        const keys = value.keys();
        for (let i = 0; i < keys.length; ++i) {
            // @ts-ignore
            clearPacked<indexof<T>, K>(keys[i], key);
            // @ts-ignore
            clearPacked<valueof<T>, K>(value.get(keys[i]), key);
        }
    } else {
        // @ts-ignore
        value.clearPacked(key);
    }
}
