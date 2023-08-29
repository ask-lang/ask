import * as assert from "assert";
import { TransformVisitor } from "visitor-as";
import { Parser, Node, DiagnosticEmitter, ASTBuilder } from "assemblyscript/dist/assemblyscript.js";
import { hasWarningMessage, hasErrorMessage } from "../diagnostic.js";

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
    assert.equal(hasWarningMessage(visitor.emitter), warn);
    assert.equal(hasErrorMessage(visitor.emitter), error);
    // when meet error, we don't check expected code
    if (error == false) {
        const actual = ASTBuilder.build(res as Node);
        assert.equal(actual.trim(), expected);
    }
}
