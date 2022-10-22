import { ISerialize, IDeserialize, Serializer, Deserializer } from "as-serde";

/**
 * A fixed array which can be serialized with a fixed length without prefix length encoding.
 */
export abstract class FixedArray<T> implements ISerialize, IDeserialize {
    [key: number]: T;

    constructor(protected inner: StaticArray<T>, protected _length: i32) {
        assert(inner.length <= _length);
        if (inner.length < _length) {
            this.inner = StaticArray.concat(inner, new StaticArray<T>(_length - inner.length));
        }
    }

    @inline
    unwrap(): StaticArray<T> {
        return this.inner;
    }

    @inline
    get length(): i32 {
        return this._length;
    }

    // @ts-ignore
    serialize<__R, __S extends Serializer<__R>>(serializer: __S): __R {
        serializer.startSerializeTuple();
        const size = this.length;
        if (isNullable<T>()) {
            for (let i = 0; i < size; i++) {
                serializer.serialize<T>(this.inner[i]);
            }
        } else {
            for (let i = 0; i < size; i++) {
                serializer.serialize<T>(this.inner[i] as nonnull<T>);
            }
        }
        return serializer.endSerializeTuple();
    }

    // @ts-ignore
    deserialize<__S extends Deserializer>(deserializer: __S): this {
        const size = this.length;

        this.inner = new StaticArray<T>(size);
        deserializer.startDeserializeTuple(size);
        if (isNullable<T>()) {
            for (let i = 0; i < size; i++) {
                this.inner[i] = deserializer.deserializeTupleElem<T>();
            }
        } else {
            for (let i = 0; i < size; i++) {
                this.inner[i] = deserializer.deserializeNonNullTupleElem<T>();
            }
        }
        deserializer.endDeserializeTuple();
        return this;
    }

    @operator("[]") private __get(index: i32): T {
        return this.inner[index];
    }

    @operator("[]=") private __set(index: i32, value: T): void {
        this.inner[index] = value;
    }

    @operator("==")
    eq(other: this): bool {
        if (this.inner.length != other.length) {
            return false;
        }
        for (let i = 0; i < this._length; i++) {
            if (this.inner[i] != other.inner[i]) {
                return false;
            }
        }
        return true;
    }

    @operator("!=")
    notEq(other: this): bool {
        return !this.eq(other);
    }
}

@final
export class FixedArray8<T> extends FixedArray<T> {
    static SIZE: i32 = 8;

    constructor(inner: StaticArray<T> = new StaticArray<T>(FixedArray8.SIZE)) {
        super(inner, FixedArray8.SIZE);
    }

    static wrap<T>(inner: StaticArray<T>): FixedArray8<T> {
        return new FixedArray8<T>(inner);
    }

    deserialize<__S extends Deserializer>(deserializer: __S): this {
        return super.deserialize<__S>(deserializer) as this;
    }
}

@final
export class FixedArray16<T> extends FixedArray<T> {
    static SIZE: i32 = 16;

    constructor(inner: StaticArray<T> = new StaticArray<T>(FixedArray16.SIZE)) {
        super(inner, FixedArray16.SIZE);
    }

    static wrap<T>(inner: StaticArray<T>): FixedArray16<T> {
        return new FixedArray16<T>(inner);
    }

    // @ts-ignore
    deserialize<__S extends Deserializer>(deserializer: __S): this {
        return super.deserialize<__S>(deserializer) as this;
    }
}

@final
export class FixedArray32<T> extends FixedArray<T> {
    static SIZE: i32 = 32;

    constructor(inner: StaticArray<T> = new StaticArray<T>(FixedArray32.SIZE)) {
        super(inner, FixedArray32.SIZE);
    }

    static wrap<T>(inner: StaticArray<T>): FixedArray32<T> {
        return new FixedArray32<T>(inner);
    }

    deserialize<__S extends Deserializer>(deserializer: __S): this {
        return super.deserialize<__S>(deserializer) as this;
    }
}

@final
export class FixedArray64<T> extends FixedArray<T> {
    static SIZE: i32 = 64;

    constructor(inner: StaticArray<T> = new StaticArray<T>(FixedArray64.SIZE)) {
        super(inner, FixedArray64.SIZE);
    }

    static wrap<T>(inner: StaticArray<T>): FixedArray64<T> {
        return new FixedArray64<T>(inner);
    }

    deserialize<__S extends Deserializer>(deserializer: __S): this {
        return super.deserialize<__S>(deserializer) as this;
    }
}

@final
export class FixedArray128<T> extends FixedArray<T> {
    static SIZE: i32 = 128;

    constructor(inner: StaticArray<T> = new StaticArray<T>(FixedArray128.SIZE)) {
        super(inner, FixedArray128.SIZE);
    }

    static wrap<T>(inner: StaticArray<T>): FixedArray128<T> {
        return new FixedArray128<T>(inner);
    }

    deserialize<__S extends Deserializer>(deserializer: __S): this {
        return super.deserialize<__S>(deserializer) as this;
    }
}
