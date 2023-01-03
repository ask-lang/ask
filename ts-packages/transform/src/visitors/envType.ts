/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TransformVisitor } from "visitor-as/dist";
import {
    DiagnosticCode,
    DiagnosticEmitter,
    TypeDeclaration,
} from "assemblyscript/dist/assemblyscript.js";
import { EnvConfig, EnvType } from "../config";
import { genNamedTypeNode } from "../astutil";
import debug from "debug";
import { extractDecorator } from "../util";
import { ContractDecoratorKind } from "../ast";

const log = debug("EnvTypeVisitor");

/**
 * EnvTypeVisitor is used to transform all env types to confiured types.
 * It should be used only inside `@contract` class and `@storage` class.
 */
export class EnvTypeVisitor extends TransformVisitor {
    constructor(public readonly emitter: DiagnosticEmitter, public readonly config: EnvConfig) {
        super();
    }

    visitTypeDeclaration(node: TypeDeclaration): TypeDeclaration {
        let decorator = extractDecorator(this.emitter, node, ContractDecoratorKind.EnvType)!;
        assert(decorator != null);

        // TODO: maybe should check it
        const alias = this.config[node.name.text as EnvType];
        if (alias) {
            node.type = genNamedTypeNode(node.type.range, alias);
            log(
                `${node.range.source.internalPath}: replace type '${node.name.text}' with type '${alias}'`,
            );
        } else {
            this.emitter.errorRelated(
                DiagnosticCode.User_defined_0,
                decorator.range,
                node.range,
                `Ask-lang: '${node.name.text}' is not a configurable type`,
            );
        }

        return node;
    }
}
