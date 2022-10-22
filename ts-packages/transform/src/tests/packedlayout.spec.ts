import { newProgram, newOptions } from "assemblyscript";
import { defaultConfig } from "../config";
import { PackedLayoutVisitor } from "../visitors";
import { checkVisitor } from "./testutil";

// Note: in tests we have to use two spaces as ident because of ASTBuilder.
function checkPackedLayoutVisitor(
    code: string,
    expected: string,
    warn = false,
    error = false
): void {
    const visitor = new PackedLayoutVisitor(newProgram(newOptions()), defaultConfig());
    checkVisitor(visitor, code, expected, warn, error);
}

describe("PackedLayoutVisitor", () => {
    it("parse normal @packedLayout", () => {
        const code = `
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
`.trim();

        const expected = `
@packedLayout
@serialize({
  omitName: true
})
@deserialize({
  omitName: true
})
export class Flipper implements __lang.PackedLayout {
  flag: bool;
  constructor(flag: bool) {
    this.flag = flag;
  }
  flip(): void {
    this.flag = !this.flag;
  }
  pullPacked<__K extends __lang.IKey>(key: __K): void {
    __lang.pullPacked<bool, __K>(this.flag, key);
  }
  pushPacked<__K extends __lang.IKey>(key: __K): void {
    __lang.pushPacked<bool, __K>(this.flag, key);
  }
  clearPacked<__K extends __lang.IKey>(key: __K): void {
    __lang.clearPacked<bool, __K>(this.flag, key);
  }
}
`.trim();

        checkPackedLayoutVisitor(code, expected);
    });

    it("parse normal @packedLayout", () => {
        const code = `
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
    `.trim();

        const expected = `
@packedLayout
@serialize({
  omitName: true
})
@deserialize({
  omitName: true
})
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
  pullPacked<__K extends __lang.IKey>(key: __K): void {
    super.pullPacked(key);
    __lang.pullPacked<bool, __K>(this.flag2, key);
  }
  pushPacked<__K extends __lang.IKey>(key: __K): void {
    super.pushPacked(key);
    __lang.pushPacked<bool, __K>(this.flag2, key);
  }
  clearPacked<__K extends __lang.IKey>(key: __K): void {
    super.clearPacked(key);
    __lang.clearPacked<bool, __K>(this.flag2, key);
  }
}
    `.trim();
        checkPackedLayoutVisitor(code, expected);
    });
});
