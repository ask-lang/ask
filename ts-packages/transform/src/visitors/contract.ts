import {
    ClassDeclaration,
    FieldDeclaration,
    MethodDeclaration,
    DiagnosticEmitter,
    DecoratorNode,
    DiagnosticCode,
    FunctionDeclaration,
    Range,
    NodeKind,
    ClassExpression,
    CommonFlags,
    ExpressionStatement,
} from "assemblyscript";
import { SimpleParser, TransformVisitor } from "visitor-as";
import {
    ContractDecoratorKind,
    MessageDeclaration,
    ConstructorDeclaration,
    hexToArrayString,
} from "../ast";
import { extractDecorator, extractConfigFromDecorator, mustBeVoidReturn } from "../util";
import { AskConfig } from "../config";
import { mustBePublicMethod, mustBeNonStaticMethod } from "../util";
import {
    KEY_TYPE_PATH,
    LANG_LIB,
    ICONTRACT_TYPE_PATH,
    IMESSAGE_TYPE_PATH,
    DENY_PAYMENT_CALL,
} from "../consts";
import { addImplement } from "../astutil";

const MESSAGE = "message";

/**
 * ContractVisitor traversal `@contract` class and collect contract related info for later processes.
 * Note: Don't reuse a visitor if you have not reset the inner state.
 */
export class ContractVisitor extends TransformVisitor {
    public readonly constructorDecls: Array<ConstructorDeclaration> = [];
    public readonly messageDecls: Array<MessageDeclaration> = [];
    public deployFunction: FunctionDeclaration | null = null;
    public callFunction: FunctionDeclaration | null = null;
    private hasBase = false;
    private contractName: string | null = null;

    constructor(public readonly emitter: DiagnosticEmitter, public readonly config: AskConfig) {
        super();
    }

    visitClassDeclaration(node: ClassDeclaration): ClassDeclaration {
        if (node.extendsType) {
            this.hasBase = true;
        }
        this.contractName = node.name.text;
        node = super.visitClassDeclaration(node);
        if (this.constructorDecls.length === 0) {
            this.emitter.error(
                DiagnosticCode.User_defined_0,
                node.range,
                "Ask-lang: `@contract` class requires at least one constructor",
            );
        }
        if (!this.hasBase && this.messageDecls.length === 0) {
            this.emitter.error(
                DiagnosticCode.User_defined_0,
                node.range,
                "Ask-lang: `@contract` class requires at least one message",
            );
        }

        node.members.push(...this.genFields(node.range));
        node.members.push(...this.genContract(node));
        this.deployFunction = ContractVisitor.createDeployAbi(node);
        this.callFunction = ContractVisitor.createCallAbi(node);
        // we assume that base class also implements IContract
        if (!this.hasBase) {
            addImplement(node, ICONTRACT_TYPE_PATH);
        }
        return node;
    }

    visitFieldDeclaration(node: FieldDeclaration): FieldDeclaration {
        return super.visitFieldDeclaration(node);
    }

    visitMethodDeclaration(node: MethodDeclaration): MethodDeclaration {
        // ignore static methods
        if (node.is(CommonFlags.STATIC)) {
            return node;
        }

        if (node.name.text === "constructor") {
            mustBePublicMethod(this.emitter, node);
            return node;
        }

        {
            let dec = extractDecorator(this.emitter, node, ContractDecoratorKind.Constructor);
            if (dec != null) {
                return this.visisConstructorDeclaration(node, dec);
            }
        }

        {
            let dec = extractDecorator(this.emitter, node, ContractDecoratorKind.Message);
            if (dec != null) {
                return this.visisMessageDeclaration(node, dec);
            }
        }

        return node;
    }

    private visisConstructorDeclaration(
        node: MethodDeclaration,
        decorator: DecoratorNode,
    ): MethodDeclaration {
        if (!this.mustBeLegalConstructor(node)) {
            return node;
        }
        const cfg = extractConfigFromDecorator(this.emitter, decorator);
        const constructorDecl = ConstructorDeclaration.extractFrom(this.emitter, node, cfg);

        this.constructorDecls.push(constructorDecl);
        return node;
    }

    private visisMessageDeclaration(
        node: MethodDeclaration,
        decorator: DecoratorNode,
    ): MethodDeclaration {
        if (!this.mustBeLegalMessage(node)) {
            return node;
        }
        const cfg = extractConfigFromDecorator(this.emitter, decorator);
        let msgDecl = MessageDeclaration.extractFrom(this.emitter, node, cfg);
        this.messageDecls.push(msgDecl);
        return node;
    }

    private genFields(_range: Range): FieldDeclaration[] {
        const decls: string[] = [];
        this.constructorDecls.forEach((decl: ConstructorDeclaration) => {
            const selector = `public static readonly ${
                decl.selectorName
            }: StaticArray<u8> = ${hexToArrayString(decl.hexSelector())};`;
            decls.push(selector);
        });
        this.messageDecls.forEach((decl: MessageDeclaration) => {
            const selector = `public static readonly ${
                decl.selectorName
            }: StaticArray<u8> = ${hexToArrayString(decl.hexSelector())};`;
            const mutates = `public static readonly ${decl.mutatesName}: bool = ${decl.mutates}`;
            const payable = `public static readonly ${decl.payableName}: bool = ${decl.payable}`;

            decls.push(selector);
            decls.push(mutates);
            decls.push(payable);
        });

        const template = `
class __Foo {
    ${decls.join("\n")}
}
`;

        const epxr = SimpleParser.parseStatement(template, false);
        assert(epxr.kind === NodeKind.EXPRESSION);
        const exprStmt = (epxr as ExpressionStatement).expression;
        assert(exprStmt.kind === NodeKind.CLASS);
        const clz = (exprStmt as ClassExpression).declaration;
        return clz.members.map((decl) => {
            assert(decl.kind === NodeKind.FIELDDECLARATION, `${decl.name.range} is invalid`);
            return decl as FieldDeclaration;
        });
    }

    private genContract(node: ClassDeclaration): MethodDeclaration[] {
        return [this.genDeploy(node, this.constructorDecls), this.genCall(node, this.messageDecls)];
    }

    private genCallSelector(_range: Range, decl: MessageDeclaration): string {
        const paramStmts = [];
        const paramsTypeName = decl.paramsTypeName();
        const methodParams = [];
        for (let i = 0; i < paramsTypeName.length; i++) {
            paramStmts.push(`const p${i} = ${MESSAGE}.getArg<${paramsTypeName[i]}>();`);
            methodParams.push(`p${i}`);
        }

        let selectorCall = `this.${decl.methodName}(${methodParams.join(", ")});`;

        let returnValue = "";
        if (decl.returnTypeName() != "void") {
            selectorCall = `
    const ret = ${selectorCall}
    `;
            returnValue = `${LANG_LIB}.env().returnValue(0, ret);`;
        }

        const pushSpread = `${LANG_LIB}.pushSpreadRoot(this, ${LANG_LIB}.Key.zero());`;
        return `
if (${MESSAGE}.isSelector(${this.contractName}.${decl.selectorName})) {
    ${!decl.mutates || decl.payable ? "" : DENY_PAYMENT_CALL}
    ${paramStmts.join("\n")}
    ${selectorCall}
    ${decl.mutates ? pushSpread : ""}
    ${returnValue}
    return 0;
}`;
    }

    private genDeploySelector(
        _range: Range,
        decl: ConstructorDeclaration,
        varName = "this",
    ): string {
        const paramStmts = [];
        const paramsTypeName = decl.paramsTypeName();
        const methodParams = [];
        for (let i = 0; i < paramsTypeName.length; i++) {
            paramStmts.push(`const p${i} = ${MESSAGE}.getArg<${paramsTypeName[i]}>();`);
            methodParams.push(`p${i}`);
        }
        return `
if (${MESSAGE}.isSelector(${this.contractName}.${decl.selectorName})) {
    ${paramStmts.join("\n")}
    ${varName}.${decl.methodName}(${methodParams.join(", ")});
}`;
    }

    private genDeploy(
        clz: ClassDeclaration,
        constructors: ConstructorDeclaration[],
    ): MethodDeclaration {
        const VAR_NAME = "contract";
        const selectors = constructors.map((decl) =>
            this.genDeploySelector(clz.range, decl, VAR_NAME),
        );
        const pushSpread = (name: string) =>
            `${LANG_LIB}.pushSpreadRoot(${name}, ${LANG_LIB}.Key.zero());`;
        const pullSpread = (name: string) =>
            `const ${name} = ${LANG_LIB}.pullSpreadRoot<this, __lang.Key>(${LANG_LIB}.Key.zero());`;
        const normalReturn = `return 0;`;

        const stmts = [];
        stmts.push(pushSpread("this"));
        stmts.push(pullSpread(VAR_NAME));
        stmts.push(...selectors);
        stmts.push(pushSpread(VAR_NAME));
        stmts.push(normalReturn);

        // const body: BlockStatement = Node.createBlockStatement(stmts, range);
        const methodDecl = `
deploy<__M extends ${IMESSAGE_TYPE_PATH}>(message: __M): i32 {
    ${stmts.join("\n")}
}
`;

        const methodNode = SimpleParser.parseClassMember(methodDecl, clz);
        assert(methodNode.kind == NodeKind.METHODDECLARATION);
        return methodNode as MethodDeclaration;
    }

    private genCall(clz: ClassDeclaration, messages: MessageDeclaration[]): FunctionDeclaration {
        const selectors = messages.map((decl) => this.genCallSelector(clz.range, decl));
        const stmts = [];
        stmts.push(...selectors);

        // The following code logic will be different depending on whether the contract has inheritance
        if (!this.hasBase) {
            const normalReturn = `return 0;`;
            stmts.push(normalReturn);
        } else {
            const superCall = `return super.call(message);`;
            stmts.push(superCall);
        }
        const methodDecl = `
call<__M extends ${IMESSAGE_TYPE_PATH}>(message: __M): i32 {
    ${stmts.join("\n")}
}
`;
        const methodNode = SimpleParser.parseClassMember(methodDecl, clz);
        assert(methodNode.kind == NodeKind.METHODDECLARATION);
        return methodNode as MethodDeclaration;
    }

    // TODO: make sure the design
    private mustBeLegalConstructor(node: MethodDeclaration): boolean {
        return (
            mustBeNonStaticMethod(this.emitter, node, ContractDecoratorKind.Constructor) &&
            mustBePublicMethod(this.emitter, node) &&
            mustBeVoidReturn(this.emitter, node) &&
            true
        );
    }

    private mustBeLegalMessage(node: MethodDeclaration): boolean {
        return mustBeNonStaticMethod(this.emitter, node, ContractDecoratorKind.Message) && true;
    }

    static createDeployAbi(contract: ClassDeclaration): FunctionDeclaration {
        const template = `
export function deploy(): i32 {
    const message = instantiate<__lang.Message>();
    const contract = new ${contract.name.text}();
    return contract.deploy(message);
}`;
        const stmt = SimpleParser.parseTopLevelStatement(template);
        assert(stmt.kind === NodeKind.FUNCTIONDECLARATION, "deploy is not function declaration");
        const func = stmt as FunctionDeclaration;
        return func;
    }

    static createCallAbi(contract: ClassDeclaration): FunctionDeclaration {
        const template = `
export function call(): i32 {
    const message = instantiate<__lang.Message>();
    const contract = __lang.pullSpreadRoot<${contract.name.text}, ${KEY_TYPE_PATH}>(${KEY_TYPE_PATH}.zero());
    return contract.call(message);
}`;
        const stmt = SimpleParser.parseTopLevelStatement(template);
        assert(stmt.kind === NodeKind.FUNCTIONDECLARATION, "call is not function declaration");
        const func = stmt as FunctionDeclaration;
        return func;
    }
}
