import { Lazy } from "ask-lang";

@contract()
export class Contract {
    _value: Lazy<u8> = new Lazy();

    constructor() {}

    @constructor()
    default(input: u8): void {
        this._value.set(input);
    }

    @message({ mutates: true })
    inc(by: u8): void {
        const prev = this._value.get();
        this._value.set(prev + by);
    }

    @message({ mutates: false })
    get(): u8 {
        return this._value.get();
    }
}