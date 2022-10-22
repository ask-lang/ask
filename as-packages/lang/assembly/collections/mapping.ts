import { ScaleSerializer } from "as-serde-scale";
import { IKey, SpreadLayout, IHash256 } from "../interfaces";
import { Key } from "../types";
import { env } from "../env/onchain";
import { ReturnCode } from "ask-contract-runtime";

/**
 * A simple hashmap which is not iterable and set/get data immediately.
 *
 * Also it won't cache KV data in momory.
 *
 * Note: The Mapping never hold k/v references, so you should call `set` method to update k/v pair storage explicitly.
 */
export class Mapping<K1, V, H extends IHash256> implements SpreadLayout {
    protected _key: Key | null = null;
    protected _hash: H = instantiate<H>();

    @inline
    protected keyAt(key: K1): Key {
        let prefix = this._key!.toBytes();
        let serKey = ScaleSerializer.serialize<K1>(key);
        // TODO: crypto hash
        let k = this._hash.hash<StaticArray<u8>, Array<u8>>(
            StaticArray.concat(prefix, serKey)
        );
        return Key.fromBytes(k);
    }

    /**
     * Make sure a value is existed at the give index. Return false if not.
     * @param index
     * @returns
     */
    has(key: K1): bool {
        let k = this.keyAt(key);
        let res = env().getContractStorageResult<Key, V>(k);
        return res.code == ReturnCode.Success;
    }

    /**
     * Gets the value at the give index. Panic if not exist.
     * @param index
     * @returns
     */
    get(key: K1): V {
        let k = this.keyAt(key);
        let res = env().getContractStorageResult<Key, V>(k);
        return res.value;
    }

    /**
     * Gets the value at the give index. Return null if not exist.
     * @param index
     * @returns
     */
    getOrNull(key: K1): V | null {
        let k = this.keyAt(key);
        let res = env().getContractStorageResult<Key, V>(k);
        if (res.code == ReturnCode.KeyNotFound) {
            return null;
        }
        return res.value;
    }

    /**
     * Sets the new value at the given index.
     * @param index
     * @param value
     */
    set(key: K1, value: V): void {
        let k = this.keyAt(key);
        env().setContractStorage<Key, V>(k, value);
    }

    /**
     * Removes value and the key from the map.
     * @param key Key to remove.
     */
    delete(key: K1): void {
        let k = this.keyAt(key);
        env().clearContractStroage<Key>(k);
    }

    pullSpread<T extends IKey>(key: T): void {
        // @ts-ignore
        ++key;
        // save the key for lazy reading
        // @ts-ignore
        this._key = key.clone() as Key;
    }

    pushSpread<T extends IKey>(key: T): void {
        // @ts-ignore
        ++key;
        // @ts-ignore
        this._key = key;
    }

    clearSpread<T extends IKey>(key: T): void {
        // nop
    }
}
