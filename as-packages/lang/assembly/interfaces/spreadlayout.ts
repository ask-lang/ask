import { IKey } from "./key";

export interface SpreadLayout {
    /**
     * Pulls an instance of `this` from the contract storage.
     * The pointer denotes the position where the instance is being pulled
     * from within the contract storage
     *
     * # Note
     * This method of pulling is depth-first: Sub-types are pulled first and
     * construct the super-type through this procedure.
     *
     * @param key
     */
    pullSpread<K extends IKey>(key: K): void;

    /**
     * Pushes an instance of `this` to the contract storage.
     *
     * - Tries to spread `this` to as many storage cells as possible.
     * - The key denotes the position where the instance is being pushed to the contract storage.
     *
     * # Note
     * This method of pushing is depth-first: Sub-types are pushed before their parent or super type.
     *
     * @param key
     */
    pushSpread<K extends IKey>(key: K): void;

    /**
     * Clears an instance of `this` from the contract storage.
     *
     * Tries to clean `this` from contract storage as if `this` was stored in it using spread layout.
     * The key denotes the position where the instance is being cleared from the contract storage.
     *
     * # Note
     * This method of clearing is depth-first: Sub-types are cleared before their parent or super type.
     * @param key
     */
    clearSpread<K extends IKey>(key: K): void;
}
