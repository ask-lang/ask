import { ASTBuilder } from "visitor-as";
import { FunctionDeclaration, newProgram, newOptions } from "assemblyscript";
import { ContractVisitor } from "../visitors";
import { defaultConfig } from "../config";
import { checkVisitor } from "./testutil";

// Note: in tests we have to use two spaces as ident because of ASTBuilder.
describe("ContractVisitor", () => {
    it("parse normal @contract", () => {
        const code = `
@contract
export class Contract {
  private data: Flipper;
  static foo: bool = false;

  constructor() {
    this.data = instantiate<Flipper>();
  }

  @constructor
  default(flag: bool): void {
      this.data.flag = flag;
  }

  @message({
    mutates: true,
  })
  flip(): void {
      const v = this.data.flag;
      this.data.flag = !v;
  }

  @message({
      mutates: false,
  })
  get(): bool {
      return this.data.flag;
  }
}
`.trim();

        const expected = `
@contract
export class Contract implements __lang.IContract {
  private data: Flipper;
  static foo: bool = false;
  constructor() {
    this.data = instantiate<Flipper>();
  }
  @constructor
  default(flag: bool): void {
    this.data.flag = flag;
  }
  @message({
    mutates: true
  })
  flip(): void {
    const v = this.data.flag;
    this.data.flag = !v;
  }
  @message({
    mutates: false
  })
  get(): bool {
    return this.data.flag;
  }
  public static readonly defaultSelector: StaticArray<u8> = [237, 75, 157, 27];
  public static readonly flipSelector: StaticArray<u8> = [99, 58, 165, 81];
  public static readonly flipMutates: bool = true;
  public static readonly flipPayable: bool = true;
  public static readonly getSelector: StaticArray<u8> = [47, 134, 91, 217];
  public static readonly getMutates: bool = false;
  public static readonly getPayable: bool = false;
  deploy<__M extends __lang.IMessage>(message: __M): i32 {
    __lang.pushSpreadRoot(this, __lang.Key.zero());
    const contract = __lang.pullSpreadRoot<this, __lang.Key>(__lang.Key.zero());
    if (message.isSelector(Contract.defaultSelector)) {
      const p0 = message.getArg<bool>();
      contract.default(p0);
    }
    __lang.pushSpreadRoot(contract, __lang.Key.zero());
    return 0;
  }
  call<__M extends __lang.IMessage>(message: __M): i32 {
    if (message.isSelector(Contract.flipSelector)) {
      this.flip();
      __lang.pushSpreadRoot(this, __lang.Key.zero());
      return 0;
    }
    if (message.isSelector(Contract.getSelector)) {
      const ret = this.get();
      __lang.env().returnValue(0, ret);
      return 0;
    }
    return 0;
  }
}`.trim();
        const visitor = new ContractVisitor(newProgram(newOptions()), defaultConfig());
        checkVisitor(visitor, code, expected);
        expect(visitor.messageDecls).toHaveLength(2);
        expect(visitor.constructorDecls).toHaveLength(1);
        const deployFunction = visitor.deployFunction as FunctionDeclaration;
        const callFunction = visitor.callFunction as FunctionDeclaration;
        expect(deployFunction != null).toBe(true);
        expect(callFunction != null).toBe(true);

        const expectedDeploy = `
export function deploy(): i32 {
  const message = instantiate<__lang.Message>();
  const contract = new Contract();
  return contract.deploy(message);
}`.trim();

        const expectedCall = `
export function call(): i32 {
  const message = instantiate<__lang.Message>();
  const contract = __lang.pullSpreadRoot<Contract, __lang.Key>(__lang.Key.zero());
  return contract.call(message);
}
`.trim();

        expect(ASTBuilder.build(deployFunction)).toBe(expectedDeploy);
        expect(ASTBuilder.build(callFunction)).toBe(expectedCall);
    });

    it("@contract inheritance", () => {
        const code = `
@contract
export class Contract extends OtherContract {
  private data: Flipper;

  constructor() {
    super();
    this.data = instantiate<Flipper>();
  }

  @constructor
  default(flag: bool): void {
      this.data.flag = flag;
  }

  @message({ mutates: true })
  flip(): bool {
      const v = this.data.flag;
      this.data.flag = !v;
      return !v;
  }
}
`.trim();

        const expected = `
@contract
export class Contract extends OtherContract {
  private data: Flipper;
  constructor() {
    super();
    this.data = instantiate<Flipper>();
  }
  @constructor
  default(flag: bool): void {
    this.data.flag = flag;
  }
  @message({
    mutates: true
  })
  flip(): bool {
    const v = this.data.flag;
    this.data.flag = !v;
    return !v;
  }
  public static readonly defaultSelector: StaticArray<u8> = [237, 75, 157, 27];
  public static readonly flipSelector: StaticArray<u8> = [99, 58, 165, 81];
  public static readonly flipMutates: bool = true;
  public static readonly flipPayable: bool = true;
  deploy<__M extends __lang.IMessage>(message: __M): i32 {
    __lang.pushSpreadRoot(this, __lang.Key.zero());
    const contract = __lang.pullSpreadRoot<this, __lang.Key>(__lang.Key.zero());
    if (message.isSelector(Contract.defaultSelector)) {
      const p0 = message.getArg<bool>();
      contract.default(p0);
    }
    __lang.pushSpreadRoot(contract, __lang.Key.zero());
    return 0;
  }
  call<__M extends __lang.IMessage>(message: __M): i32 {
    if (message.isSelector(Contract.flipSelector)) {
      const ret = this.flip();
      __lang.pushSpreadRoot(this, __lang.Key.zero());
      __lang.env().returnValue(0, ret);
      return 0;
    }
    return super.call(message);
  }
}`.trim();

        const visitor = new ContractVisitor(newProgram(newOptions()), defaultConfig());
        checkVisitor(visitor, code, expected);
        expect(visitor.messageDecls).toHaveLength(1);
        expect(visitor.constructorDecls).toHaveLength(1);
    });

    it("mutates @message has return value", () => {
        const code = `
@contract
export class Contract {
  private data: Flipper;

  constructor() {
    this.data = instantiate<Flipper>();
  }

  @constructor
  default(flag: bool): void {
      this.data.flag = flag;
  }

  @message({ mutates: true })
  flip(): bool {
      const v = this.data.flag;
      this.data.flag = !v;
      return !v;
  }
}
`.trim();

        const expected = `
@contract
export class Contract implements __lang.IContract {
  private data: Flipper;
  constructor() {
    this.data = instantiate<Flipper>();
  }
  @constructor
  default(flag: bool): void {
    this.data.flag = flag;
  }
  @message({
    mutates: true
  })
  flip(): bool {
    const v = this.data.flag;
    this.data.flag = !v;
    return !v;
  }
  public static readonly defaultSelector: StaticArray<u8> = [237, 75, 157, 27];
  public static readonly flipSelector: StaticArray<u8> = [99, 58, 165, 81];
  public static readonly flipMutates: bool = true;
  public static readonly flipPayable: bool = true;
  deploy<__M extends __lang.IMessage>(message: __M): i32 {
    __lang.pushSpreadRoot(this, __lang.Key.zero());
    const contract = __lang.pullSpreadRoot<this, __lang.Key>(__lang.Key.zero());
    if (message.isSelector(Contract.defaultSelector)) {
      const p0 = message.getArg<bool>();
      contract.default(p0);
    }
    __lang.pushSpreadRoot(contract, __lang.Key.zero());
    return 0;
  }
  call<__M extends __lang.IMessage>(message: __M): i32 {
    if (message.isSelector(Contract.flipSelector)) {
      const ret = this.flip();
      __lang.pushSpreadRoot(this, __lang.Key.zero());
      __lang.env().returnValue(0, ret);
      return 0;
    }
    return 0;
  }
}`.trim();

        const visitor = new ContractVisitor(newProgram(newOptions()), defaultConfig());
        checkVisitor(visitor, code, expected);
        expect(visitor.messageDecls).toHaveLength(1);
        expect(visitor.constructorDecls).toHaveLength(1);
    });

    it("parse @contract without @constructor", () => {
        const code = `
@contract
export class Contract {
  private data: Flipper;

  constructor() {
    this.data = instantiate<Flipper>();
  }

  @message
  flip(): void {
      const v = this.data.flag;
      this.data.flag = !v;
  }

  @message({
      mutates: false,
  })
  get(): bool {
      return this.data.flag;
  }
}
`.trim();

        const visitor = new ContractVisitor(newProgram(newOptions()), defaultConfig());
        checkVisitor(visitor, code, "", false, true);
        expect(visitor.messageDecls).toHaveLength(2);
        expect(visitor.constructorDecls).toHaveLength(0);
    });
});
