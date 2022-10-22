/**
 * Some util functions to generate a AST node for transform
 */
import {
    ClassDeclaration,
    CommonFlags,
    DecoratorNode,
    Expression,
    ImportStatement,
    NamedTypeNode,
    NamespaceDeclaration,
    Node,
    NodeKind,
    Range,
    Statement,
    TypeName,
} from "assemblyscript";
import { SimpleParser } from "visitor-as/dist";
import { hasDecorator } from "../util";

/**
 * A helper for generate NamedTypeNode which may be namespaced type
 * @param range
 * @param typeName
 * @param isNullable
 * @returns
 */
export function genNamedTypeNode(
    range: Range,
    typeName: string,
    isNullable = false,
): NamedTypeNode {
    const named = genTypeName(typeName, range);
    const namedType = Node.createNamedType(named, null, isNullable, range);
    return namedType;
}

/**
 * Add an interface to be implemented to a class.
 * @param node class needed to implement a interface
 * @param interfaceName The interface path
 * @returns node
 */
export function addImplement(node: ClassDeclaration, interfaceName: string): ClassDeclaration {
    const implType = genTypeName(interfaceName, node.range);
    if (node.implementsTypes == null) {
        node.implementsTypes = [];
    }
    node.implementsTypes.push(Node.createNamedType(implType, null, false, node.range));
    return node;
}

/**
 * Add interface list to be implemented to a class.
 * @param node class needed to implement a interface
 * @param interfaceNames The interface path list
 * @returns node
 */
export function addImplements(node: ClassDeclaration, interfaceNames: string[]): ClassDeclaration {
    for (let name of interfaceNames) {
        addImplement(node, name);
    }
    return node;
}

/**
 * append `@serialize` to a declaration
 * @param range node range
 * @param decl declaration node
 */
export function addSerializeDecorator(decl: {
    range: Range;
    decorators: DecoratorNode[] | null;
}): void {
    const decName = "serialize";
    if (!hasDecorator(decl.decorators, decName)) {
        // we can reduce code size by this conifg.
        const cfg = `{omitName: true}`;
        let expr = SimpleParser.parseExpression(cfg);
        assert(expr.kind == NodeKind.LITERAL);
        addDecorator(decl, genDecorator(decl.range, decName, [expr]));
    }
}

/**
 * append `@deserialize` to a declaration
 * @param range node range
 * @param decl declaration node
 */
export function addDeserializeDecorator(decl: {
    range: Range;
    decorators: DecoratorNode[] | null;
}): void {
    const decName = "deserialize";
    if (!hasDecorator(decl.decorators, decName)) {
        // we can reduce code size by this conifg.
        const cfg = `{omitName: true}`;
        let expr = SimpleParser.parseExpression(cfg);
        assert(expr.kind == NodeKind.LITERAL);
        addDecorator(decl, genDecorator(decl.range, decName, [expr]));
    }
}

/**
 * append a decorator to a declaration
 * @param range node range
 * @param decl declaration node pending to be decorated
 */
export function addDecorator(
    decl: { decorators: DecoratorNode[] | null },
    decorator: DecoratorNode,
): void {
    if (decl.decorators == null) {
        decl.decorators = [];
    }
    decl.decorators.push(decorator);
}

function genDecorator(range: Range, id: string, args: Expression[] | null = null): DecoratorNode {
    return Node.createDecorator(Node.createIdentifierExpression(id, range), args, range);
}

/**
 * genTypeName create type name for namespaced type such as `__lang.AccountId`.
 * @param name type name
 * @param range
 * @returns typeName ast node
 */
export function genTypeName(name: string, range: Range): TypeName {
    assert(name != "", "name cannot be empty");
    const names = name.split(".").reverse();

    let prev: TypeName | null = null;
    for (let i = 0; i < names.length; i++) {
        let curName = names[i];
        prev = new TypeName(Node.createIdentifierExpression(curName, range), prev, range);
    }
    return prev as TypeName;
}

/**
 * create a namespace
 * @param range related code range
 * @param members all stmts in namespace
 */
export function genNamespcae(
    range: Range,
    namepsace: string,
    members: Statement[],
): NamespaceDeclaration {
    const name = Node.createIdentifierExpression(namepsace, range);
    return Node.createNamespaceDeclaration(name, null, CommonFlags.EXPORT, members, range);
}

/**
 * Genetate an import statement, e.g.`import * as __lang from "ask-lang"`
 * @param namespace imported namespaced
 * @param path module path
 * @param range
 * @returns ImportStatement
 */
export function genImportStatement(namespace: string, path: string, range: Range): ImportStatement {
    return Node.createWildcardImportStatement(
        Node.createIdentifierExpression(namespace, range),
        Node.createStringLiteralExpression(path, range),
        range,
    );
}
