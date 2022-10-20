@event({ id: 1 })
export class FlipEvent {
    flag: bool;

    constructor(flag: bool) {
        this.flag = flag;
    }
}

@spreadLayout
@packedLayout
export class Flipper {
    flag: bool;
    constructor(flag: bool = false) {
        this.flag = flag;
    }
}