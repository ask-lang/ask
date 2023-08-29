import { i128, u128 } from "../index";
import { instantiateRaw } from "..";
import { SpreadLayout, IKey } from "../interfaces";
import { FixedArray } from "../fixedArrays";
import { forwardClearPacked, forwardPullPacked, forwardPushPacked } from "./index";

/**
 * Pulls an instance of type `T` from the contract storage using spread layout.
 *
 * The root key denotes the offset into the contract storage where the
 * instance of type `T` is being pulled from.
 *
 * # Note
 * - The routine assumes that the instance has previously been stored to
 * the contract storage using spread layout.
 * - Users should prefer using this function directly instead of using the
 * methods on [`SpreadLayout`].
 * @param rootKey
 * @returns
 */
export function pullSpreadRoot<T extends SpreadLayout, K extends IKey>(rootKey: K): T {
    // @ts-ignore
    const key: K = rootKey.clone();
    return pullSpread<T, K>(key);
}

/**
 * Pushes the entity to the contract storage using spread layout.
 *
 * The root key denotes the offset into the contract storage where the
 * instance of type `T` is being pushed to.
 *
 * # Note
 * - The routine will push the given entity to the contract storage using
 * spread layout.
 * - Users should prefer using this function directly instead of using the
 * methods on [`SpreadLayout`].
 * @param value
 * @param rootKey
 */
export function pushSpreadRoot<T extends SpreadLayout, K extends IKey>(value: T, rootKey: K): void {
    // TODO:
    // @ts-ignore
    const key: K = rootKey.clone();
    pushSpread<T, K>(value, key);
}

/**
 * Clears the entity from the contract storage using spread layout.
 *
 * The root key denotes the offset into the contract storage where the
 * instance of type `T` is being cleared from.
 *
 * # Note
 *
 * - The routine assumes that the instance has previously been stored to
 * the contract storage using spread layout.
 *
 * - Users should prefer using this function directly instead of using the
 * methods on [`SpreadLayout`].
 * @param value
 * @param rootKey
 */
export function clearSpreadRoot<T extends SpreadLayout, K extends IKey>(
    value: T,
    rootKey: K,
): void {
    // @ts-ignore
    const key: K = rootKey.clone();
    clearSpread<T, K>(value, key);
}

export function pullSpread<T extends SpreadLayout, K extends IKey>(key: K): T {
    let dummy: T = changetype<T>(0);
    if (!isReference<T>() || false) {
        return forwardPullPacked<T, K>(key);
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
        isArray<T>() ||
        isArrayLike<T>() ||
        false
    ) {
        return forwardPullPacked<T, K>(key);
    }
    // @ts-ignore
    else if (isDefined(value.pullSpread)) {
        const value: T = instantiateRaw<T>();
        // @ts-ignore
        value.pullSpread<K>(key);
        return value;
    } else if (
        // @ts-ignore
        dummy instanceof Set ||
        // @ts-ignore
        dummy instanceof Map ||
        // @ts-ignore
        dummy instanceof FixedArray ||
        false
    ) {
        return forwardPullPacked<T, K>(key);
    } else {
        const value: T = instantiateRaw<T>();
        // @ts-ignore
        value.pullSpread<K>(key);
        return value;
    }
}

export function pushSpread<T extends SpreadLayout, K extends IKey>(value: T, key: K): void {
    if (!isReference<T>() || false) {
        forwardPushPacked<T, K>(value, key);
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
        isArray<T>() ||
        isArrayLike<T>() ||
        false
    ) {
        forwardPushPacked<T, K>(value, key);
    }
    // @ts-ignore
    else if (isDefined(value.pushSpread)) {
        // @ts-ignore
        value.pushSpread<K>(key);
    } else if (
        // @ts-ignore
        value instanceof Set ||
        // @ts-ignore
        value instanceof Map ||
        // @ts-ignore
        dummy instanceof FixedArray ||
        false
    ) {
        forwardPushPacked<T, K>(value, key);
    } else {
        // @ts-ignore
        value.pushSpread<K>(key);
    }
}

export function clearSpread<T extends SpreadLayout, K extends IKey>(value: T, key: K): void {
    if (!isReference<T>() || false) {
        forwardClearPacked<T, K>(value, key);
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
        isArray<T>() ||
        isArrayLike<T>() ||
        false
    ) {
        forwardClearPacked<T, K>(value, key);
    }
    // @ts-ignore
    else if (isDefined(value.clearSpread)) {
        // @ts-ignore
        value.clearSpread<K>(key);
    } else if (
        // @ts-ignore
        value instanceof Set ||
        // @ts-ignore
        value instanceof Map ||
        // @ts-ignore
        dummy instanceof FixedArray ||
        false
    ) {
        forwardClearPacked<T, K>(value, key);
    } else {
        // @ts-ignore
        value.clearSpread<K>(key);
    }
}
