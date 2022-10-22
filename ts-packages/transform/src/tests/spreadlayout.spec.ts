import { newProgram, newOptions } from "assemblyscript";
import { defaultConfig } from "../config";
import { SpreadLayoutVisitor } from "../visitors";
import { checkVisitor } from "./testutil";

// Note: in tests we have to use two spaces as ident because of ASTBuilder.
function checkSpreadLayoutVisitor(
    code: string,
    expected: string,
    warn = false,
    error = false,
): void {
    const visitor = new SpreadLayoutVisitor(newProgram(newOptions()), defaultConfig());
    checkVisitor(visitor, code, expected, warn, error);
}
describe("SpreadLayoutVisitor", () => {
    it("parse normal @spreadLayout", () => {
        const code = `
@spreadLayout
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
@spreadLayout
export class Flipper implements __lang.SpreadLayout {
  flag: bool;
  constructor(flag: bool) {
    this.flag = flag;
  }
  flip(): void {
    this.flag = !this.flag;
  }
  pullSpread<__K extends __lang.IKey>(key: __K): void {
    this.flag = __lang.pullSpread<bool, __K>(key);
  }
  pushSpread<__K extends __lang.IKey>(key: __K): void {
    __lang.pushSpread<bool, __K>(this.flag, key);
  }
  clearSpread<__K extends __lang.IKey>(key: __K): void {
    __lang.clearSpread<bool, __K>(this.flag, key);
  }
}
`.trim();

        checkSpreadLayoutVisitor(code, expected);
    });

    it("parse inheritance for @spreadLayout", () => {
        const code = `
@spreadLayout
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
@spreadLayout
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
  pullSpread<__K extends __lang.IKey>(key: __K): void {
    super.pullSpread(key);
    this.flag2 = __lang.pullSpread<bool, __K>(key);
  }
  pushSpread<__K extends __lang.IKey>(key: __K): void {
    super.pushSpread(key);
    __lang.pushSpread<bool, __K>(this.flag2, key);
  }
  clearSpread<__K extends __lang.IKey>(key: __K): void {
    super.clearSpread(key);
    __lang.clearSpread<bool, __K>(this.flag2, key);
  }
}
`.trim();
        checkSpreadLayoutVisitor(code, expected);
    });
});
