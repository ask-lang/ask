import {} from "ask-lang";

@packedLayout
export class Flipper {
    flag: bool;
    constructor(flag: bool) {
        this.flag = flag;
    }

    flip(): void {
        this.flag = !this.flag;
    }
}

// storage read once
@packedLayout
export class Flipper2 extends Flipper {
    flag2: bool;
    constructor() {
        super(true);
        this.flag2 = false;
    }

    flip(): void {
        const prev = this.flag;
        this.flag = this.flag2;
        this.flag2 = prev;
    }
}
