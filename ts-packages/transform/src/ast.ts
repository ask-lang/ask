import {
    ClassDeclaration,
    MethodDeclaration,
    FunctionTypeNode,
    DiagnosticCode,
    DiagnosticEmitter,
} from "visitor-as/as";
import { DecoratorConfig, extractConfigFromDecorator, extractDecorator } from "./util";
import { utils } from "visitor-as/dist";
import { DecoratorNode } from "assemblyscript";
import blake from "blakejs";

/**
 * Ask supported decorators.
 */
export enum ContractDecoratorKind {
    // tuple
    Tuple = "tuple",
    Enumeration = "enumeration",
    Variant = "variant",
    SpreadLayout = "spreadLayout",
    PackedLayout = "packedLayout",
    Contract = "contract",
    Event = "event",
    // TODO:
    Topic = "topic",
    Primitive = "primitive",
    Constructor = "constructor",
    Message = "message",
    EnvType = "envType",
    // TODO:
    Ignore = "Ignore",
    // TODO: add document decorator
}

/**
 * Any decorators that support addition config
 * should extend this interface.
 */
export interface AskNode {
    /** contract Kind of this node. */
    readonly contractKind: ContractDecoratorKind;
}

/**
 * Transform a hex string value to a JS literal array value string.
 * @param hex a hex with optional prefix
 * @returns
 */
export function hexToArrayString(hex: string, byteLength = 4): string {
    if (hex.startsWith("0x")) {
        hex = hex.substring(2);
    }
    const hexArray = [];
    for (let i = 0; i < byteLength * 2; i += 2) {
        hexArray.push("0x" + hex.substring(i, i + 2));
    }

    return `[${hexArray.join(", ")}]`;
}

/**
 * A decorator AST interface that support contract calling.
 */
export interface ContractMethodNode extends AskNode {
    /**
     * Whether this method could mutate contract storage
     */
    readonly mutates: boolean;
    // TODO: we should define three value for payable: mustPay/mustNotPay/optionalPay
    /**
     * Whether this method could pay addition balance.
     */
    readonly payable: boolean;
    /**
     * The contract method name.
     */
    readonly methodName: string;
    /**
     * The contract method selector name.
     *
     * Used by codegen.
     */
    readonly selectorName: string;
    /**
     * The contract selector.
     * @returns
     */
    hexSelector(): string;
    /**
     * The arguments the method received.
     */
    paramsTypeName(): string[];
    /**
     * The value the method return.
     */
    returnTypeName(): string;
    /**
     * The method documents.
     *
     * Not used now.
     */
    docs(): string[];
}

/**
 * MessageDeclaration represents a `@message` info
 */
export class MessageDeclaration implements ContractMethodNode {
    public readonly contractKind: ContractDecoratorKind = ContractDecoratorKind.Message;

    constructor(
        public readonly method: MethodDeclaration,
        public readonly selector: string | null,
        public readonly mutates: boolean,
        public readonly payable: boolean = true,
    ) {}

    paramsTypeName(): string[] {
        return getParamsTypeName(this.method.signature);
    }

    returnTypeName(): string {
        return getReturnTypeName(this.method.signature);
    }

    /**
     * If not define a selector, it use blake2 of method name as hex selector
     * @returns
     */
    hexSelector(): string {
        return hexSelector(this.selector, this.methodName);
    }

    get methodName(): string {
        return this.method.name.text;
    }

    get selectorName(): string {
        return `${this.method.name.text}Selector`;
    }

    get mutatesName(): string {
        return `${this.method.name.text}Mutates`;
    }

    get payableName(): string {
        return `${this.method.name.text}Payable`;
    }

    docs(): string[] {
        return [];
    }

    /**
     * Collect message method infos from config.
     * @param node
     * @param cfg
     * @returns
     */
    static extractFrom(
        emitter: DiagnosticEmitter,
        node: MethodDeclaration,
        cfg: DecoratorConfig,
    ): MessageDeclaration {
        let msgMutates = false;
        let msgPayable = true;
        const decorator = cfg.decorator;
        let selector = cfg.get("selector");
        let msgSelector = extractSelector(emitter, selector, node, decorator);
        const mutates = cfg.get("mutates");
        if (mutates) {
            if (mutates === "true") {
                msgMutates = true;
            } else if (mutates === "false") {
                // do nothing
            } else {
                emitter.errorRelated(
                    DiagnosticCode.User_defined_0,
                    node.range,
                    decorator.range,
                    `Ask-lang: Illegal 'mutates' config, must be true or false`,
                );
            }
        }

        const payable = cfg.get("payable");
        if (payable) {
            if (payable === "true") {
                msgPayable = true;
            } else if (payable === "false") {
                msgPayable = false;
            } else {
                emitter.errorRelated(
                    DiagnosticCode.User_defined_0,
                    node.range,
                    decorator.range,
                    `Ask-lang: Illegal 'payable' config, must be true or false`,
                );
            }
        }

        // TODO: now when mutates be false, payable must be false but won't generate check code for immutable message.
        if (msgMutates) {
            msgPayable = true;
        } else {
            msgPayable = false;
        }

        return new MessageDeclaration(utils.cloneNode(node), msgSelector, msgMutates, msgPayable);
    }
}

/**
 * ConstructorDeclaration represents a `@constructor` info
 */
export class ConstructorDeclaration implements ContractMethodNode {
    public readonly contractKind: ContractDecoratorKind = ContractDecoratorKind.Constructor;

    /**
     * mutates is always be true
     */
    public readonly mutates: boolean = true;
    /**
     * payable is always be true
     */
    public readonly payable: boolean = true;
    constructor(
        public readonly method: MethodDeclaration,
        public readonly selector: string | null,
    ) {}

    paramsTypeName(): string[] {
        return getParamsTypeName(this.method.signature);
    }

    returnTypeName(): string {
        return getReturnTypeName(this.method.signature);
    }

    /**
     * If not define a selector, it use blake2 of method name as hex selector
     * @returns
     */
    hexSelector(): string {
        return hexSelector(this.selector, this.methodName);
    }

    get methodName(): string {
        return this.method.name.text;
    }

    get selectorName(): string {
        return `${this.method.name.text}Selector`;
    }

    docs(): string[] {
        return [];
    }

    /**
     * Collect constructor method infos from config.
     * @param node
     * @param cfg
     * @returns
     */
    static extractFrom(
        emitter: DiagnosticEmitter,
        node: MethodDeclaration,
        cfg: DecoratorConfig,
    ): ConstructorDeclaration {
        let selector = cfg.get("selector");
        let msgSelector = extractSelector(emitter, selector, node, cfg.decorator);

        return new ConstructorDeclaration(utils.cloneNode(node), msgSelector);
    }
}

/**
 * EventDeclaration represents a `@event` info
 */
export class EventDeclaration implements AskNode {
    public readonly contractKind: ContractDecoratorKind = ContractDecoratorKind.Event;
    constructor(
        /**
         * Event Id
         */
        public readonly id: number,
        public readonly event: ClassDeclaration,
    ) {}

    /**
     * Collect event infos from config.
     * @param node
     * @param cfg
     * @returns
     */
    static extractFrom(emitter: DiagnosticEmitter, node: ClassDeclaration): EventDeclaration {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const decorator = extractDecorator(emitter, node, ContractDecoratorKind.Event)!;
        const cfg = extractConfigFromDecorator(emitter, decorator);
        const eventId = cfg.get("id");

        let id = -1;
        if (!eventId) {
            emitter.errorRelated(
                DiagnosticCode.User_defined_0,
                node.range,
                decorator.range,
                `Ask-lang: '@event' must have id config`,
            );
        } else if (!isNaN(+eventId)) {
            id = +eventId;
        } else {
            emitter.errorRelated(
                DiagnosticCode.User_defined_0,
                node.range,
                decorator.range,
                `Ask-lang: '@event' id config is illegal`,
            );
        }
        return new EventDeclaration(id, utils.cloneNode(node));
    }
}

function getParamsTypeName(fn: FunctionTypeNode): string[] {
    return fn.parameters.map((p) => p.type.range.toString());
}

function getReturnTypeName(fn: FunctionTypeNode): string {
    return fn.returnType.range.toString();
}

export function hexSelector(selector: string | null, methodName: string): string {
    if (selector != null) {
        return selector;
    }
    return "0x" + blake.blake2bHex(methodName, undefined, 32).substring(0, 8);
}

function extractSelector(
    emitter: DiagnosticEmitter,
    selector: string | undefined,
    node: MethodDeclaration,
    decorator: DecoratorNode,
): string | null {
    if (selector) {
        selector = selector.substring(1, selector.length - 1);
        if (selector.length == 10 && !isNaN(+selector)) {
            return selector;
        } else {
            emitter.errorRelated(
                DiagnosticCode.User_defined_0,
                node.range,
                decorator.range,
                `Ask-lang: Illegal 'selector' config. Should be 4 bytes hex string`,
            );
            return null;
        }
    }
    return null;
}
