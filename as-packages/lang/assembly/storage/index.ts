import { IKey } from "../interfaces";
import { pushPackedRoot, clearPackedRoot, pullPackedRoot } from "./packed";

export * from "./packed";
export * from "./spread";

/**
 * Pulls an instance of type `T` in packed fashion from the contract storage.
 * 
 * Loads the instance from the storage location identified by `key`.
 * 
 * The storage entity is expected to be decodable in its packed form.
 * 
 * # Note
 * 
 * Use this utility function to use a packed pull operation for the type
 * instead of a spread storage layout pull operation.
 * @param key 
 * @returns 
 */
// @ts-ignore
@inline
export function forwardPullPacked<T, K extends IKey>(key: K): T {
    // @ts-ignore
    return pullPackedRoot<T, K>(++key);
}

/**
 * Pushes an instance of type `T` in packed fashion to the contract storage.
 * 
 *  Stores the instance to the storage location identified by `key`.
 * The storage entity is expected to be encodable in its packed form.
 * 
 *  # Note
 * 
 *  Use this utility function to use a packed push operation for the type
 *  instead of a spread storage layout push operation.
 * @param data 
 * @param key 
 */
// @ts-ignore
@inline
export function forwardPushPacked<T, K extends IKey>(data: T, key: K): void {
    // @ts-ignore
    pushPackedRoot<T, K>(data, ++key);
}

/**
 * Clears an instance of type `T` in packed fashion from the contract storage.
 * 
 * Clears the instance from the storage location identified by `key`.
 * The cleared storage entity is expected to be encoded in its packed form.
 * 
 *  # Note
 * 
 *  Use this utility function to use a packed clear operation for the type
 * instead of a spread storage layout clear operation.
 * @param data 
 * @param key 
 */
// @ts-ignore
@inline
export function forwardClearPacked<T, K extends IKey>(data: T, key: K): void {
    // @ts-ignore
    clearPackedRoot<T, K>(data, ++key);
}
