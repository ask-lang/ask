import {
    ClassDeclaration,
    FieldDeclaration,
    DiagnosticEmitter,
    MethodDeclaration,
    NodeKind,
    CommonFlags,
} from "assemblyscript";
import { SimpleParser, TransformVisitor } from "visitor-as";
import { mustBeLegalStorageField } from "../util";

import { addDeserializeDecorator, addImplement, addSerializeDecorator } from "../astutil";
import { AskConfig } from "../config";
import { IKEY_TYPE_PATH, PACKED_LAYOUT_TYPE_PATH } from "../consts";
import { uniqBy } from "lodash";

/**
 * PackedLayoutVisitor traversal `@packedLayout` class and implements PackedLayout interface for it.
 * Note: Don't reuse a visitor if you have not reset the inner state.
 */
export class PackedLayoutVisitor extends TransformVisitor {
    private fields: FieldDeclaration[] = [];
    private hasBase = false;

    constructor(public readonly emitter: DiagnosticEmitter, public readonly config: AskConfig) {
        super();
    }

    visitClassDeclaration(node: ClassDeclaration): ClassDeclaration {
        this.hasBase = node.extendsType ? true : false;
        node = super.visitClassDeclaration(node);
        this.fields = uniqBy(this.fields, (f) => f.range.toString());
        node.members.push(...this.genPackedLayout(node));
        addSerializeDecorator(node);
        addDeserializeDecorator(node);
        // we assume that base class also implements PackedLayout
        if (!this.hasBase) {
            addImplement(node, PACKED_LAYOUT_TYPE_PATH);
        }
        return node;
    }

    visitFieldDeclaration(node: FieldDeclaration): FieldDeclaration {
        // ignore static fields
        if (node.is(CommonFlags.STATIC)) {
            return node;
        }

        if (mustBeLegalStorageField(this.emitter, node)) {
            this.fields.push(node);
        }

        return node;
    }

    private genPackedLayout(node: ClassDeclaration): MethodDeclaration[] {
        const res = [this.genPullPacked(node), this.genPushPacked(node), this.genClearPacked(node)];
        return res;
    }

    private genPullPacked(clz: ClassDeclaration): MethodDeclaration {
        const METHOD_PULL = "pullPacked";

        const superCall = this.hasBase ? `super.${METHOD_PULL}(key);` : "";
        const stmts = this.fields
            .map(
                (field) =>
                    `__lang.${METHOD_PULL}<${field.type?.range.toString()}, __K>(this.${
                        field.name.text
                    }, key);`,
            )
            .join("\n");

        const methodDecl = `${METHOD_PULL}<__K extends ${IKEY_TYPE_PATH}>(key: __K): void { ${superCall} ${stmts} }`;
        const methodNode = SimpleParser.parseClassMember(methodDecl, clz);
        assert(methodNode.kind == NodeKind.METHODDECLARATION);
        return methodNode as MethodDeclaration;
    }

    private genPushPacked(clz: ClassDeclaration): MethodDeclaration {
        const METHOD_PUSH = "pushPacked";

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
        assert(methodNode.kind == NodeKind.METHODDECLARATION);
        return methodNode as MethodDeclaration;
    }

    private genClearPacked(clz: ClassDeclaration): MethodDeclaration {
        const METHOD_CLEAR = "clearPacked";

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
        assert(methodNode.kind == NodeKind.METHODDECLARATION);
        return methodNode as MethodDeclaration;
    }
}
