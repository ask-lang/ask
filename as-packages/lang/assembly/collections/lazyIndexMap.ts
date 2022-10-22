import { Key } from "../types";
import { EntryState, StorageEntry } from "./lazy";
import { IKey, SpreadLayout } from "../interfaces";
import { instantiateRaw } from "as-serde-scale";
import { env } from "../env";

/**
 * A lazy map whose key is based on u32.
 * It will cache the operations result of key/value internally.
 *
 * Note: The V type must be PackedLayout.
 */
export class LazyIndexMap<V> implements SpreadLayout {
    protected _key: Key | null = null;
    protected _map: Map<u32, StorageEntry<V>> = new Map();

    /**
     * Creates a new empty lazy map positioned at the given key.
     * It's low level APIs for other collections.
     * @param key
     * @returns
     */
    static lazy<V>(key: Key): LazyIndexMap<V> {
        let res = new LazyIndexMap<V>();
        res._key = key;
        return res;
    }

    @unsafe
    @inline
    private lazyLoad(index: u32): StorageEntry<V> {
        const entry = StorageEntry.from<V>(instantiateRaw<V>());
        entry.pullPackedRoot<Key>(this.keyAt(index));
        this._map.set(index, entry);
        return entry;
    }

    /**
     * Returns the associated storage key.
     * @returns
     */
    @inline
    key(): Key | null {
        return this._key;
    }

    /**
     * Sets the new value at the given index.
     * @param index
     * @param value
     */
    set(index: u32, value: V): void {
        this._map.set(index, new StorageEntry<V>(value, EntryState.Updated));
    }

    /**
     * Gets the value at the give index. Panic if not exist.
     * @param index
     * @returns
     */
    get(index: u32): V {
        if (this._map.has(index)) {
            return this.getExistedAt(index);
        } else {
            return this.lazyLoad(index).get();
        }
    }

    /**
     * Make sure a value is existed at the give index. Return false if not.
     * @param index
     * @returns
     */
    has(index: u32): bool {
        if (this._map.has(index)) {
            return true;
        }
        const entry = StorageEntry.from<V>(instantiateRaw<V>());
        entry.pullPackedRoot<Key>(this.keyAt(index));
        this._map.set(index, entry);
        return !entry.isEmpty();
    }

    /**
     * Gets the value at the given index.
     *
     * It assumes the index have been accessed before.
     * @param index
     * @returns
     */
    @inline
    @unsafe
    getExistedAt(index: u32): V {
        const entry = this._map.get(index);
        return entry.get();
    }

    /**
     * Deletes and returns the value at the given index.
     *
     * It assumes that the value is existed.
     * @param index
     */
    remove(index: u32): V {
        if (this._map.has(index)) {
            return this.removeExistedAt(index);
        } else {
            return this.removeAt(index);
        }
    }

    /**
     * Deletes the value at the given index.
     * @param index
     */
    delete(index: u32): void {
        if (this._map.has(index)) {
            this.deleteExistedAt(index);
        } else {
            this.deleteAt(index);
        }
    }

    /**
     * Removes and returns the value at the given index.
     *
     * It assumes the index have been accessed before. It can optimize the performance of access storage
     * @param index
     * @returns
     */
    @inline
    @unsafe
    removeExistedAt(index: u32): V {
        const entry = this._map.get(index);
        let val = entry.get();
        entry._clear();
        return val;
    }

    /**
     * Deletes the value at the given index.
     *
     * It assumes the index have been accessed before. It can optimize the performance of access storage
     * @param index
     */
    @inline
    @unsafe
    deleteExistedAt(index: u32): void {
        const entry = this._map.get(index);
        entry._clear();
    }

    /**
     * Removes and returns the value at the given index.
     * It sets `CLEARED` flag and zero value for the value at given index.
     * @param index
     * @returns
     */
    @inline
    removeAt(index: u32): V {
        const entry = this.lazyLoad(index);
        const res = entry.get();
        entry._clear();
        return res;
    }

    /**
     * Deletes the value at the given index.
     * It sets `CLEARED` flag and zero value for the value at given index.
     * @param index
     */
    @inline
    deleteAt(index: u32): void {
        this._map.set(
            index,
            new StorageEntry<V>(changetype<V>(0), EntryState.Cleared)
        );
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
        // @ts-ignore
        this._key = key;
        let keys = this._map.keys();
        for (let i = 0; i < keys.length; i++) {
            let k = keys[i];
            let entry = this._map.get(k);
            entry.pushPackedRoot<Key>(this.keyAt(k));
        }
    }

    @inline
    protected keyAt(key: u32): Key {
        // make indexKey unique by adding a big offset key.
        return (this._key as Key).add((key as u64) << 32);
    }

    /**
     * Clears the underlying storage of the entry at the given index.
     * Note: It's used to build `clear` semantic.
     * This does not synchronize the lazy index map's memory-side cache which invalidates future accesses the cleared entry.
     * Care should be taken when using this API.
     * @param key
     */
    @unsafe
    clearAt(key: u32): void {
        const indexKey = this.keyAt(key);
        env().clearContractStroage<Key>(indexKey);
    }

    clearSpread<K extends IKey>(_key: K): void {
        // nop
        // The high-level abstractions that build upon them are responsible for cleaning up.
    }
}
