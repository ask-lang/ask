import { TransformVisitor } from "visitor-as";
import { Parser, Node, DiagnosticEmitter, ASTBuilder } from "assemblyscript/dist/assemblyscript";
import { hasWarningMessage, hasErrorMessage } from "../diagnostic";

export function checkVisitor<Visitor extends TransformVisitor & { emitter: DiagnosticEmitter }>(
    visitor: Visitor,
    code: string,
    expected: string,
    warn = false,
    error = false,
): void {
    const parser = new Parser();
    parser.parseFile(code, "index.ts", true);
    const res = visitor.visit(parser.sources[0]);
    expect(hasWarningMessage(visitor.emitter)).toBe(warn);
    expect(hasErrorMessage(visitor.emitter)).toBe(error);
    // when meet error, we don't check expected code
    if (error == false) {
        const actual = ASTBuilder.build(res as Node);
        expect(actual.trim()).toBe(expected);
    }
}
