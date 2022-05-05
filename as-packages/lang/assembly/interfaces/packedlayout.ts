import { IKey } from "./key";

export interface PackedLayout {
    /**
     * Indicates to `this` that is has just been pulled from the storage.
     *
     * Most types will have to implement a simple forwarding to their fields.
     * @param key
     */
    pullPacked<K extends IKey>(key: K): void;

    /**
     * Indicates to `this` that it is about to be pushed to contract storage.
     *
     * Most types will have to implement a simple forwarding to their fields.
     * @param key
     */
    pushPacked<K extends IKey>(key: K): void;

    /**
     * Indicates to `this` that it is about to be cleared from contract storage.
     *
     * Most types will have to implement a simple forwarding to their fields.
     * @param key
     */
    clearPacked<K extends IKey>(key: K): void;
}
