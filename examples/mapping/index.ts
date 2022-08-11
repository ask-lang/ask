import {HashKeccak256, AccountId, Mapping } from "@ask-lang/ask-lang";

@contract()
export class Contract {
    _map: Mapping<AccountId, u32, HashKeccak256> = new Mapping();

    @constructor()
    default(): void {}

    @message({ mutates: true })
    add(k: AccountId, v: u32): void {
        this._map.set(k, v);
    }

    @message({ mutates: false })
    get(k: AccountId): u32 {
        return this._map.get(k);
    }

    @message({ mutates: false })
    has(k: AccountId): bool {
        return this._map.has(k);
    }

    @message({ mutates: true })
    remove(k: AccountId): void {
        return this._map.delete(k);
    }
}
