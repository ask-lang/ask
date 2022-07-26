import { Vector } from "ask-lang";

@contract()
export class Contract {
    _vector: Vector<u32>;

    constructor() {
        this._vector = new Vector<u32>();
    }

    @constructor()
    default(): void {}

    @message({ mutates: true })
    push(v: u32): void {
        this._vector.push(v);
    }

    @message({ mutates: true })
    pop(): u32 {
        return this._vector.pop();
    }

    @message({ mutates: true })
    clear(): void {
        this._vector.clear();
    }

    @message({ mutates: true })
    set(i: u32, val: u32): void {
        this._vector.set(i, val);
    }

    @message()
    get(i: u32): u32 {
        return this._vector.get(i);
    }

    @message()
    length(): u32 {
        return this._vector.length;
    }
}
