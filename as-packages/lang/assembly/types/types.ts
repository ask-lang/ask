import { u128 } from "as-bignum";
import { StringBuffer } from "as-buffers";
import { FixedArray32 } from "../fixedArrays";

// TODO: need to redesign something
// @ts-ignore
@lazy const ACCOUNT_BUF = new StringBuffer(68);

@serialize({ omitName: true })
@deserialize({ omitName: true })
export class AccountId {
    constructor(protected inner: FixedArray32<u8> = new FixedArray32<u8>()) {}

    @operator("==")
    eq(other: this): bool {
        return this.inner == other.inner;
    }

    @operator("!=")
    notEq(other: this): bool {
        return !this.eq(other);
    }

    toString(): string {
        ACCOUNT_BUF.resetOffset();
        for (let i = 0, len = this.inner.length; i < len; i++) {
            ACCOUNT_BUF.writeCodePoint(this.inner[i] as i32);
        }
        return ACCOUNT_BUF.toString();
    }
}

export type Balance = u128;
export type Gas = u64;
export type Timestamp = u64;
export type BlockNumber = u32;
export type Hash = FixedArray32<u8>;

// @ts-ignore
@lazy
export const ZERO_ACCOUNT = new AccountId();
