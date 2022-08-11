import { Lazy } from "@ask-lang/ask-lang";

@contract()
export class Contract {
    // read storage when used
    _value: Lazy<u32> = new Lazy();

    constructor() {}

    @constructor()
    default(): void {}

    @message({ mutates: true })
    set(v: u32): void {
        this._value.set(v);
    }

    @message({ mutates: false })
    get(): u32 {
        return this._value.get();
    }
}
