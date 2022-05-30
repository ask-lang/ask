/**
 * Some util function to determinate or extract properties of AST node.
 * 
 */
import {
    ClassDeclaration,
    CommonFlags,
    DeclarationStatement,
    DecoratorNode,
    DiagnosticCode,
    DiagnosticEmitter,
    FieldDeclaration,
    FunctionDeclaration,
    LiteralExpression,
    LiteralKind,
    MethodDeclaration,
    NamedTypeNode,
    NodeKind,
    ObjectLiteralExpression,
    SourceKind,
    TypeName,
    Node,
    StringLiteralExpression,
    Range,
} from "assemblyscript";
import { ContractDecoratorKind } from "./ast";

// TODO: maybe we can extract it as a common util package.

export function removeExported(node: { flags: CommonFlags }): void {
    node.flags = node.flags & ~CommonFlags.EXPORT;
}

export function isEntry(node: Node): boolean {
    return node.range.source.sourceKind == SourceKind.USER_ENTRY;
}

export function mustBeVoidReturn(
    emitter: DiagnosticEmitter,
    node: FunctionDeclaration
): boolean {
    let ret = true;
    if (node.signature.returnType.range.toString() != "void") {
        emitter.errorRelated(
            DiagnosticCode.User_defined_0,
            node.range,
            node.signature.returnType.range,
            `Ask-lang: @constructor method must return void`
        );
        ret = false;
    }

    return ret;
}

export function mustBeLegalStorageField(
    emitter: DiagnosticEmitter,
    node: FieldDeclaration
): boolean {
    let ret = true;

    if (node.is(CommonFlags.READONLY)) {
        emitter.error(
            DiagnosticCode.User_defined_0,
            node.range,
            `Ask-lang: '${node.name.range.toString()}' cannot be readonly`
        );
        ret = false;
    }

    if (node.type?.isNullable) {
        emitter.errorRelated(
            DiagnosticCode.User_defined_0,
            node.name.range,
            node.type.range,
            `Ask-lang: '${node.name.range.toString()}' storage cannot be null`
        );
        ret = false;
    }

    return ret;
}

/**
 * check if decorator have params
 * @param emitter emit warning if return false
 * @param decorator pending checked decorator
 * @returns
 */
export function shouldBeNoParamDecorator(
    emitter: DiagnosticEmitter,
    decorator: DecoratorNode
): boolean {
    if (decorator.args !== null && decorator.args.length !== 0) {
        emitter.warning(
            DiagnosticCode.User_defined_0,
            decorator.range,
            `'${decorator.name.range.toString()}' now do not support any params`
        );

        return false;
    }
    return true;
}

/**
 * check if contract method is public
 * @param emitter emit error if return false
 * @param node contract method
 * @returns
 */
export function mustBePublicMethod(
    emitter: DiagnosticEmitter,
    node: MethodDeclaration
): boolean {
    // `public` by default, so we check `protected` and `private`
    if (node.is(CommonFlags.PROTECTED) || node.is(CommonFlags.PRIVATE)) {
        emitter.errorRelated(
            DiagnosticCode.User_defined_0,
            node.range,
            node.name.range,
            `'${node.name.range.toString()}' must be public`
        );
        return false;
    }
    return true;
}

/**
 * check if contract method is non-static
 * @param emitter emit error if return false
 * @param node contract method
 * @param kind contract kind info
 * @returns
 */
export function mustBeNonStaticMethod(
    emitter: DiagnosticEmitter,
    node: MethodDeclaration,
    kind: ContractDecoratorKind
): boolean {
    if (node.is(CommonFlags.STATIC)) {
        emitter.errorRelated(
            DiagnosticCode.User_defined_0,
            node.range,
            node.name.range,
            `'@${kind.toString()}' cannot be static`
        );
        return false;
    }
    return true;
}
/**
 * return true if class have not a parent
 * @param emitter emit error if return false
 * @param node
 * @returns
 */
export function mustBeNoExtends(
    emitter: DiagnosticEmitter,
    node: ClassDeclaration
): boolean {
    if (node.extendsType != null) {
        emitter.errorRelated(
            DiagnosticCode.User_defined_0,
            node.range,
            node.extendsType.range,
            `'${node.name.range.toString()}' cannot extends other class`
        );

        return false;
    }
    return true;
}

export function namedTypeNodeToString(node: NamedTypeNode): string {
    let cur: TypeName | null = node.name;
    const names = [];
    do {
        names.push(cur.identifier.range.toString());
        cur = cur.next;
    } while (cur != null);

    return names.join(".");
}

/**
 *
 * @param decorators a group decorators
 * @param name a decorator name
 * @returns return true if has the decorator
 */
export function hasDecorator(
    decorators: DecoratorNode[] | null,
    name: string
): boolean {
    return getDecorator(decorators, name) ? true : false;
}

/**
 * Return the first matched decorator
 * @param decorators a group decorators
 * @param name a decorator name
 * @returns
 */
export function getDecorator(
    decorators: DecoratorNode[] | null,
    name: string
): DecoratorNode | null {
    if (decorators == null) {
        return null;
    }
    const decs = filterDecorators(
        decorators,
        (node) => node.name.range.toString() === "@" + name
    );
    return decs.length > 0 ? decs[0] : null;
}

/**
 *
 * @param decorators
 * @param pred a filter function for decorators
 * @returns
 */
export function filterDecorators(
    decorators: DecoratorNode[] | null,
    pred: (node: DecoratorNode) => bool
): DecoratorNode[] {
    const decs: DecoratorNode[] = [];
    if (decorators === null) return decs;
    for (const decorator of decorators) {
        if (pred(decorator)) decs.push(decorator);
    }
    return decs;
}

/**
 * return the last decorator of method or null if have not
 * @param node contract constructor method
 */
export function extractDecorator(
    emitter: DiagnosticEmitter,
    node: DeclarationStatement,
    kind: ContractDecoratorKind
): DecoratorNode | null {
    const decs = filterDecorators(
        node.decorators,
        (node) => node.name.range.toString() === "@" + kind
    );

    // cannot have duplicated decorator
    if (decs.length > 1) {
        emitter.warningRelated(
            DiagnosticCode.Duplicate_decorator,
            node.range,
            decs[0].range,
            kind.toString()
        );
    }

    let dec = decs[decs.length - 1];
    return dec ? dec : null;
}

/**
 * A general format config for decorator.
 * 
 * It's no-nested json which value must be string.
 */
export class DecoratorConfig extends Map<string, string> {
    constructor(public readonly decorator: DecoratorNode) {
        super();
    }
    static extractFrom(
        emitter: DiagnosticEmitter,
        decorator: DecoratorNode
    ): DecoratorConfig {
        return extractConfigFromDecorator(emitter, decorator);
    }
}

/**
 * Extract the config map from decorator params
 * @param decorator
 * @returns
 */
export function extractConfigFromDecorator(
    emitter: DiagnosticEmitter,
    decorator: DecoratorNode
): DecoratorConfig {
    const obj = extractLiteralObject(emitter, decorator);
    const cfg = extractConfigFromLiteral(emitter, decorator, obj);

    return cfg;
}

/**
 * return the first literal object for decorator or null if have not
 * @param emitter
 * @param decorator
 * @returns
 */
export function extractLiteralObject(
    emitter: DiagnosticEmitter,
    decorator: DecoratorNode
): ObjectLiteralExpression | null {
    const args = decorator.args ? decorator.args : [];
    const literals: ObjectLiteralExpression[] = [];
    for (const arg of args) {
        if (arg.kind !== NodeKind.LITERAL) {
            emitter.errorRelated(
                DiagnosticCode.User_defined_0,
                decorator.range,
                arg.range,
                "Ask-lang: Arguments must be object literal"
            );
        }
        const literalArg = arg as LiteralExpression;
        if (literalArg.literalKind !== LiteralKind.OBJECT) {
            emitter.errorRelated(
                DiagnosticCode.User_defined_0,
                decorator.range,
                arg.range,
                "Ask-lang: Arguments must be object literal"
            );
        }
        literals.push(literalArg as ObjectLiteralExpression);
    }

    let literal = literals[literals.length - 1];
    return literal ? literal : null;
}

/**
 * return the first literal string for decorator or null if have not
 * @param emitter
 * @param decorator
 * @returns
 */
export function extractLiteralString(
    emitter: DiagnosticEmitter,
    decorator: DecoratorNode,
    range: Range
): StringLiteralExpression | null {
    const args = decorator.args ? decorator.args : [];
    if (args.length > 1 || args.length == 0) {
        emitter.errorRelated(
            DiagnosticCode.User_defined_0,
            decorator.range,
            range,
            `Ask-lang: Need a string argument`
        );
        return null;
    }
    let arg = args[0];
    if (arg.kind !== NodeKind.LITERAL) {
        emitter.errorRelated(
            DiagnosticCode.User_defined_0,
            decorator.range,
            arg.range,
            "Ask-lang: Argument must be string literal"
        );
        return null;
    }
    const literal = arg as StringLiteralExpression;
    if (literal.literalKind !== LiteralKind.STRING) {
        emitter.errorRelated(
            DiagnosticCode.User_defined_0,
            decorator.range,
            arg.range,
            "Ask-lang: Argument must be string literal"
        );
        return null;
    }
    return literal;
}

/**
 * Extract a config map from JS object literal.
 * @param emitter
 * @param node
 * @returns
 */
export function extractConfigFromLiteral(
    emitter: DiagnosticEmitter,
    decorator: DecoratorNode,
    node: ObjectLiteralExpression | null
): DecoratorConfig {
    const config = new DecoratorConfig(decorator);
    if (node == null) {
        return config;
    }
    for (let i = 0; i < node.names.length; i++) {
        const key = node.names[i].text;
        const value = node.values[i];
        // we only support the folllowing literals
        if (
            value.isLiteralKind(LiteralKind.INTEGER) ||
            value.isLiteralKind(LiteralKind.STRING) ||
            value.kind === NodeKind.TRUE ||
            value.kind === NodeKind.FALSE
        ) {
            config.set(key, value.range.toString());
        } else {
            emitter.error(
                DiagnosticCode.User_defined_0,
                node.range,
                "Ask-lang: Unspported decorator param syntax"
            );
        }
    }
    return config;
}
