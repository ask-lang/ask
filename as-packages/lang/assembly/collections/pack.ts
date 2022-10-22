import { clearPacked, pullPacked, pushPacked } from "../storage";
import { PackedLayout, SpreadLayout, IKey } from "../interfaces";
import { forwardPullPacked, forwardPushPacked, forwardClearPacked } from "../storage/index";
import { Deserializer, Serializer, ISerialize, IDeserialize } from "as-serde";

export class Pack<T> implements PackedLayout, SpreadLayout, ISerialize, IDeserialize {
    constructor(public inner: T = instantiate<T>()) {}

    @inline
    unwrap(): T {
        return this.inner;
    }

    @inline
    pullSpread<K extends IKey>(key: K): void {
        // @ts-ignore
        this.inner = forwardPullPacked<T, K>(key);
    }

    @inline
    pushSpread<K extends IKey>(key: K): void {
        // @ts-ignore
        forwardPushPacked<T, K>(this.inner, key);
    }

    @inline
    clearSpread<K extends IKey>(key: K): void {
        // @ts-ignore
        forwardClearPacked<T, K>(this.inner, key);
    }

    @inline
    pullPacked<K extends IKey>(key: K): void {
        pullPacked<T, K>(this.inner, key);
    }

    @inline
    pushPacked<K extends IKey>(key: K): void {
        pushPacked<T, K>(this.inner, key);
    }

    @inline
    clearPacked<K extends IKey>(key: K): void {
        clearPacked<T, K>(this.inner, key);
    }

    // @ts-ignore
    serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
        // @ts-ignore
        return this.inner.serialize<__R, __S>(serializer);
    }

    // @ts-ignore
    deserialize<__S extends Deserializer>(deserializer: __S): this {
        // @ts-ignore
        this.inner = this.inner.deserialize<__S>(deserializer);
        return this;
    }
}
