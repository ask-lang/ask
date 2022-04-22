/**
 * Ikey represents a storage key. Every storage item will has a unique key.
 */
export interface IKey {
    /**
     * Returns a static bytes for current key value.
     */
    toBytes(): StaticArray<u8>;

    /**
     * Clone a copy of current key value.
     */
    clone(): IKey;

    /**
     * Advance the key value.
     *
     * Note: A class implements IKey must overload prefix '++' operator.
     */
    inc(): this;

    /**
     * Advance the key value by rhs.
     */
    add(rhs: u64): this;

    /**
     * Returns a string represents of current key.
     *
     * It's a method used for debug
     */
    toString(): string;
}
