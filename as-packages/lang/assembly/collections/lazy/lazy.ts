import { IKey } from "../../interfaces";
import { SpreadLayout } from "../../interfaces";
import { Key } from "../../types";
import { EntryState, StorageEntry } from "./storageEntry";
import { pullPackedRoot } from "@ask-lang/ask-lang";
import { pushPackedRoot, clearPackedRoot } from "../../storage/packed";
import { instantiateRaw } from "../..";

/**
 * A lazy storage entity. It only support packedLayout storage.
 *
 * This loads its value from storage upon first use.
 * Use this if the storage field does not need to be loaded in some or most cases.
 */
export class Lazy<T> implements SpreadLayout {
    protected _key: Key | null = null;

    constructor(
        /**
         * A cache for reading only once.
         */
        protected _cache: StorageEntry<T> | null = null
    ) {}

    /**
     * This eventually lazily loads the value from the contract storage.
     *
     * Panics if decoding the loaded value to `T` failed or value is cleared.
     * @returns wrapped value
     */
    @inline
    get(): T {
        let cache = this.loadThroughCache();
        return cache.get();
    }

    /**
     * Sets the new value in this cell, without executing any read or write from underlying storage.
     * @param newValue
     */
    @inline
    set(newValue: T): void {
        if (this._cache === null) {
            // @ts-ignore
            this._cache = StorageEntry.from<T>(newValue);
        } else {
            // @ts-ignore
            (this._cache as StorageEntry<T>).set(newValue);
        }
    }

    /**
     * If cache not exist, we pull it from storage and set its state as `Pulled`.
     * @returns
     */
    @inline
    @unsafe
    private loadThroughCache(): StorageEntry<T> {
        if (this._cache === null) {
            // @ts-ignore
            const data = pullPackedRoot<T, Key>(this._key as Key);
            // @ts-ignore
            this._cache = new StorageEntry(data, EntryState.Pulled);
        }
        // @ts-ignore
        return this._cache as StorageEntry<T>;
    }

    pullSpread<K extends IKey>(key: K): void {
        // @ts-ignore
        ++key;
        // save the key for lazy reading
        // @ts-ignore
        this._key = key.clone() as Key;
    }

    pushSpread<K extends IKey>(key: K): void {
        // @ts-ignore
        ++key;
        // not push storage if we have not pulled or written.
        if (this._cache !== null) {
            // @ts-ignore
            pushPackedRoot<T, K>((this._cache as StorageEntry<T>).get(), key);
        }
    }

    clearSpread<K extends IKey>(key: K): void {
        // @ts-ignore
        ++key;
        let cache: StorageEntry<T>;
        if (this._cache !== null) {
            cache = this._cache as StorageEntry<T>;
        } else {
            // we need to instantiate it for clear storage.
            // @ts-ignore
            cache = new StorageEntry<T>(instantiateRaw<T>(), EntryState.Pulled);
        }
        // @ts-ignore
        clearPackedRoot<T, K>(cache.get(), key);
    }
}
