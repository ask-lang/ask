import _ from "lodash";
import { SimpleParser, TransformVisitor } from "visitor-as";
import {
    ClassDeclaration,
    FieldDeclaration,
    DiagnosticEmitter,
    MethodDeclaration,
    NodeKind,
    CommonFlags,
} from "assemblyscript/dist/assemblyscript.js";
import { mustBeLegalStorageField } from "../util.js";

import { addImplement } from "../astutil/index.js";
import { AskConfig } from "../config.js";
import { IKEY_TYPE_PATH, SPREAD_LAYOUT_TYPE_PATH } from "../consts.js";

/**
 * SpreadLayoutVisitor traversal `@spreadLayout` class and implements SpreadLayout interface for it. The fields must be Codec types.
 * Note: Don't reuse a visitor if you have not reset the inner state.
 */
export class SpreadLayoutVisitor extends TransformVisitor {
    private fields: FieldDeclaration[] = [];
    private hasBase = false;

    constructor(public readonly emitter: DiagnosticEmitter, public readonly config: AskConfig) {
        super();
    }

    visitClassDeclaration(node: ClassDeclaration): ClassDeclaration {
        this.hasBase = node.extendsType ? true : false;

        node = super.visitClassDeclaration(node);
        this.fields = _.uniqBy(this.fields, (f) => f.range.toString());
        node.members.push(...this.genSpreadLayout(node));
        // we assume that base class also implements SpreadLayout
        if (!this.hasBase) {
            addImplement(node, SPREAD_LAYOUT_TYPE_PATH);
        }
        return node;
    }

    visitFieldDeclaration(node: FieldDeclaration): FieldDeclaration {
        // ignore static fields
        if (node.is(CommonFlags.Static)) {
            return node;
        }

        if (mustBeLegalStorageField(this.emitter, node)) {
            this.fields.push(node);
        }

        return node;
    }

    private genSpreadLayout(node: ClassDeclaration): MethodDeclaration[] {
        const res = [this.genPullSpread(node), this.genPushSpread(node), this.genClearSpread(node)];
        return res;
    }

    private genPullSpread(clz: ClassDeclaration): MethodDeclaration {
        const METHOD_PULL = "pullSpread";

        const superCall = this.hasBase ? `super.${METHOD_PULL}(key);` : "";
        const stmts = this.fields
            .map(
                (field) =>
                    `this.${
                        field.name.text
                    } = __lang.${METHOD_PULL}<${field.type?.range.toString()}, __K>(key);`,
            )
            .join("\n");

        const methodDecl = `${METHOD_PULL}<__K extends ${IKEY_TYPE_PATH}>(key: __K): void { ${superCall} ${stmts} }`;
        const methodNode = SimpleParser.parseClassMember(methodDecl, clz);
        assert(methodNode.kind == NodeKind.MethodDeclaration);
        return methodNode as MethodDeclaration;
    }

    private genPushSpread(clz: ClassDeclaration): MethodDeclaration {
        const METHOD_PUSH = "pushSpread";

        const superCall = this.hasBase ? `super.${METHOD_PUSH}(key);` : "";
        const stmts = this.fields
            .map(
                (field) =>
                    `__lang.${METHOD_PUSH}<${field.type?.range.toString()}, __K>(this.${
                        field.name.text
                    }, key);`,
            )
            .join("\n");

        const methodDecl = `${METHOD_PUSH}<__K extends ${IKEY_TYPE_PATH}>(key: __K): void { ${superCall} ${stmts} }`;
        const methodNode = SimpleParser.parseClassMember(methodDecl, clz);
        assert(methodNode.kind == NodeKind.MethodDeclaration);
        return methodNode as MethodDeclaration;
    }

    private genClearSpread(clz: ClassDeclaration): MethodDeclaration {
        const METHOD_CLEAR = "clearSpread";

        const superCall = this.hasBase ? `super.${METHOD_CLEAR}(key);` : "";
        const stmts = this.fields
            .map(
                (field) =>
                    `__lang.${METHOD_CLEAR}<${field.type?.range.toString()}, __K>(this.${
                        field.name.text
                    }, key);`,
            )
            .join("\n");

        const methodDecl = `${METHOD_CLEAR}<__K extends ${IKEY_TYPE_PATH}>(key: __K): void { ${superCall} ${stmts} }`;
        const methodNode = SimpleParser.parseClassMember(methodDecl, clz);
        assert(methodNode.kind == NodeKind.MethodDeclaration);
        return methodNode as MethodDeclaration;
    }
}
