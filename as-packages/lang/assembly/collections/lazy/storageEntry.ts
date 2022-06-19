import { IKey } from "../../interfaces";
import { PackedLayout, SpreadLayout } from "../../interfaces";
import {
    clearPackedRoot,
    pullPackedRootResult,
    pushPackedRoot,
} from "../../storage/packed";
import {
    pullPacked,
    clearSpread,
    pullSpread,
    pushSpread,
    pushPacked,
    clearPacked,
} from "../../storage";
import { ReturnCode } from "as-contract-runtime";

/**
 * EntryState represents a storage entry state.
 */
export const enum EntryState {
    /**
     * Pulled mean the memory storage is latest and it is pulled from underlying storage.
     */
    Pulled = 1,

    /**
     * When user write new data, it turns to `Updated`.
     * Updated means the latest storage is in memory, and the underlying storage is old.
     * So we should push storage if we want to write, or we do not need to pull storage if we want to read.
     */
    Updated = 1 << 1,

    /**
     * When user clear storage, it turns to `Cleared`.
     * Cleared means the we should clear data from both memory and storage.
     */
    Cleared = 1 << 2,
}

/**
 * StorageEntry contains a storage entry state for stroage entry. It restrict some operations for a storage.
 *
 * It's a low-level API.
 */
export class StorageEntry<T> implements SpreadLayout, PackedLayout {
    constructor(
        // `_value` may be a zero value if `_state` is `Cleared`
        protected _value: T,
        protected _state: EntryState
    ) {}

    static from<T>(value: T): StorageEntry<T> {
        return new StorageEntry<T>(value, EntryState.Updated);
    }

    /**
     * Sets the new value into the entry and returns the old value.
     * @param newValue
     */
    @inline
    set(newValue: T): void {
        this._state = EntryState.Updated;
        this._value = newValue;
    }
    /**
     * Gets the value
     * @returns
     */
    @inline
    get(): T {
        assert(!this.isEmpty());
        return this._value;
    }

    @inline
    @unsafe
    _clear(): void {
        this._state = EntryState.Cleared;
        this._value = changetype<T>(0);
    }

    @inline
    isEmpty(): bool {
        return this._state == EntryState.Cleared;
    }

    /**
     * Pulls the entity from the underlying associated storage as a `SpreadLayout` storage layout representation.
     * @param key
     */
    @inline
    pullSpread<K extends IKey>(key: K): void {
        // @ts-ignore
        ++key;
        this.pullSpreadRoot<K>(key);
    }

    @inline
    pullSpreadRoot<K extends IKey>(key: K): void {
        // @ts-ignore
        this._value = pullSpread<T, K>(key);
        this._state = EntryState.Pulled;
    }

    /**
     * Pushes the underlying associated data to the contract storage using the `SpreadLayout` storage layout.
     * @param key
     */

    @inline
    pushSpread<K extends IKey>(key: K): void {
        // @ts-ignore
        ++key;
        this.pushSpreadRoot<K>(key);
    }

    pushSpreadRoot<K extends IKey>(key: K): void {
        if (this._state == EntryState.Updated) {
            this._state = EntryState.Pulled;
            // @ts-ignore
            pushSpread<T, K>(this._value, key);
        } else if (this._state == EntryState.Cleared) {
            // @ts-ignore
            clearSpread<T, K>(this._value, key);
        }
    }

    @inline
    clearSpread<K extends IKey>(key: K): void {
        // @ts-ignore
        ++key;
        this.clearSpreadRoot<K>(key);
    }

    @inline
    clearSpreadRoot<K extends IKey>(key: K): void {
        // @ts-ignore
        clearSpread<T, K>(this._value, key);
    }

    pullPacked<K extends IKey>(key: K): void {
        pullPacked<T, K>(this._value, key);
    }

    // Pulls the entity from the underlying associated storage as packed representation.
    // We assume entry state is not used before.
    // If it will be called, it should be called immediately after initialization
    pullPackedRoot<K extends IKey>(key: K): void {
        // @ts-ignore
        let result = pullPackedRootResult<T, K>(key);
        if (result.code == ReturnCode.Success) {
            this._value = result.value;
            this._state = EntryState.Pulled;
        } else {
            this._state = EntryState.Cleared;
        }
    }

    pushPacked<K extends IKey>(key: K): void {
        pushPacked<T, K>(this._value, key);
    }

    pushPackedRoot<K extends IKey>(key: K): void {
        if (this._state == EntryState.Updated) {
            this._state = EntryState.Pulled;
            // @ts-ignore
            pushPackedRoot<T, K>(this._value, key);
        } else if (this._state == EntryState.Cleared) {
            // @ts-ignore
            clearPackedRoot<T, K>(this._value, key);
        }
    }

    clearPacked<K extends IKey>(key: K): void {
        clearPacked<T, K>(this._value, key);
    }

    clearPackedRoot<K extends IKey>(key: K): void {
        this._clear();
        // @ts-ignore
        clearPackedRoot<T, K>(this._value, key);
    }
}
