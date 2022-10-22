/* eslint-disable @typescript-eslint/no-inferrable-types */
import { env, Pack } from "ask-lang";
import { FlipEvent, Flipper } from "../flipper/storage";
import { Contract } from "../flipper";

// Two flag flipper
@contract
export class Contract2 extends Contract {
    _data2: Pack<Flipper>;

    constructor() {
        super();
        this._data2 = instantiate<Pack<Flipper>>(new Flipper(false));
    }

    get data2(): Flipper {
        return this._data2.unwrap();
    }

    set data2(data: Flipper) {
        this._data2 = new Pack(data);
    }

    @constructor()
    default2(flag: bool, flag2: bool): void {
        this.data.flag = flag;
        this.data.flag = flag2;
    }

    @message({ mutates: true })
    flip(): void {
        this.data.flag = !this.data.flag;
        this.data2.flag = !this.data2.flag;
        // @ts-ignore
        env().emitEvent(new FlipEvent(this.data.flag));
        // @ts-ignore
        env().emitEvent(new FlipEvent(this.data2.flag));
    }

    @message()
    get(): bool {
        return this.data.flag;
    }

    @message()
    get2(): bool {
        return this.data.flag;
    }
}
