import { IKey, SpreadLayout } from "../interfaces";
import { clearSpread, pullSpread, pushSpread } from "../storage";
import { LazyIndexMap } from "./lazyIndexMap";

/**
 * A spread version array. elements are stored in different positions.
 * 
 * Note: The element type T must be PackedLayout.
 */
@final
export class Vector<T> implements SpreadLayout {
    protected _len: u32 = 0;
    protected _elems: LazyIndexMap<T> = new LazyIndexMap<T>();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {}

    get length(): u32 {
        return this._len;
    }

    /**
     * The vector length.
     */
    private set length(len: u32) {
        this._len = len;
    }

    /**
     * Get the element at given index.
     * @param index 
     * @returns 
     */
    get(index: u32): T {
        assert(this.length > index);
        return this._elems.get(index);
    }

    /**
     * Set the element at given index.
     * @param index 
     * @param value 
     */
    set(index: u32, value: T): void {
        assert(this.length > index);
        this._elems.set(index, value);
    }

    /**
     * Returns true if the length is zero.
     * @returns 
     */
    isEmpty(): bool {
        return this.length == 0;
    }

    /**
     * Clear all elements and set length to zero.
     * @returns 
     */
    clear(): void {
        if (this.isEmpty()) {
            return;
        }
        const len: u32 = this.length;
        for (let i: u32 = 0; i < len; i++) {
            this._elems.deleteAt(i);
        }
        this.length = 0;
    }

    /**
     * Push a element to the last.
     * @param value 
     * @returns 
     */
    @inline
    push(value: T): u32 {
        this._elems.set(this.length, value);
        this.length = this.length + 1;
        return this.length;
    }

    /**
     * Pop the last element and return it.
     * @returns 
     */
    @inline
    pop(): T {
        assert(!this.isEmpty());
        this.length = this.length - 1;
        return this._elems.remove(this.length);
    }

    /**
     * Pop the last element.
     */
    @inline
    removeLast(): void {
        assert(!this.isEmpty());
        this.length = this.length - 1;
        this._elems.delete(this.length);
    }

    pullSpread<K extends IKey>(key: K): void {
        // @ts-ignore
        this._len = pullSpread<u32, K>(key);
        this._elems.pullSpread<K>(key);
    }

    pushSpread<K extends IKey>(key: K): void {
        // @ts-ignore
        pushSpread<u32, K>(this._len, key);
        this._elems.pushSpread<K>(key);
    }

    protected clearAll(): void {
        if (this._elems.key() === null) {
            // We won't clear any storage if we are in lazy state since there
            // probably has not been any state written to storage, yet.
            return;
        }
        const len: u32 = this.length;
        for (let i: u32 = 0; i < len; i++) {
            this._elems.clearAt(i);
        }
    }

    clearSpread<K extends IKey>(key: K): void {
        this.clearAll();
        // @ts-ignore
        clearSpread<u32, K>(this._len, key);
        this._elems.clearSpread<K>(key);
    }
}
