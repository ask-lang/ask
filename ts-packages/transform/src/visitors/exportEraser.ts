import { TransformVisitor } from "visitor-as";
import {
    ClassDeclaration,
    CommonFlags,
    DiagnosticCode,
    DiagnosticEmitter,
    EnumDeclaration,
    ExportDefaultStatement,
    ExportStatement,
    FunctionDeclaration,
    InterfaceDeclaration,
    TypeDeclaration,
    VariableDeclaration,
} from "assemblyscript";
import { removeExported } from "../util";

/**
 * ExportEraser remove all `export` flags for current source.
 *
 * It's used to remove all export items in entrypoint file excluding whiltelist (`call` and `deploy` functions).
 * Thus a contract source also could be a normal lib.
 */
export class ExportEraser extends TransformVisitor {
    constructor(
        public readonly emitter: DiagnosticEmitter,
        public readonly whitelist: Set<{ flags: CommonFlags }> = new Set()
    ) {
        super();
    }

    private removeExportFlag<T extends { flags: CommonFlags }>(node: T): T {
        if (this.whitelist.has(node)) {
            return node;
        }
        removeExported(node);
        return node;
    }

    visitClassDeclaration(node: ClassDeclaration): ClassDeclaration {
        return this.removeExportFlag(node);
    }

    visitFunctionDeclaration(node: FunctionDeclaration): FunctionDeclaration {
        return this.removeExportFlag(node);
    }

    visitTypeDeclaration(node: TypeDeclaration): TypeDeclaration {
        return this.removeExportFlag(node);
    }

    visitVariableDeclaration(node: VariableDeclaration): VariableDeclaration {
        return this.removeExportFlag(node);
    }

    visitEnumDeclaration(
        node: EnumDeclaration,
        _isDefault?: boolean
    ): EnumDeclaration {
        return this.removeExportFlag(node);
    }

    visitInterfaceDeclaration(
        node: InterfaceDeclaration
    ): InterfaceDeclaration {
        return this.removeExportFlag(node);
    }

    visitExportDefaultStatement(
        node: ExportDefaultStatement
    ): ExportDefaultStatement {
        this.emitter.error(
            DiagnosticCode.User_defined_0,
            node.range,
            `The entrypoint contract cannot use 'export default' syntax`
        );
        return node;
    }

    visitExportStatement(node: ExportStatement): ExportStatement {
        this.emitter.error(
            DiagnosticCode.User_defined_0,
            node.range,
            `The entrypoint contract cannot use 'export from' syntax`
        );
        return node;
    }
}
