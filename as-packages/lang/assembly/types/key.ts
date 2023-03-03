import { u256 } from "../index";
import { IKey } from "../interfaces";

/**
 * Key use a u256 number as underlaying storage key.
 */
export class Key implements IKey {
    private key: u256;

    constructor(key: u256) {
        this.key = key;
    }

    clone(): Key {
        return new Key(u256.fromU256(this.key));
    }

    add(rhs: u64): this {
        // @ts-ignore
        this.key += u256.fromU64(rhs);
        return this;
    }

    @inline
    toBytes(): StaticArray<u8> {
        return this.key.toStaticBytes();
    }

    @operator.prefix("++")
    inc(): this {
        // @ts-ignore
        ++this.key;
        return this;
    }

    toString(): string {
        return this.key.toBytes().toString();
    }

    @inline
    static fromBytes(bytes: Array<u8>): Key {
        return new Key(u256.fromBytesLE(bytes));
    }

    @inline
    static zero(): Key {
        return new Key(u256.Zero);
    }
}
