export interface IContractMetadata {
    readonly metadataVersion: string;
    readonly source: ISource;
    readonly contract: IContract;
    readonly spec: IContractSpec;
    readonly storage: ILayout;
    readonly types: Array<ITypeDef>;
}

export interface ISource {
    hash: string;
    readonly language: string;
    readonly compiler: string;
}

export type ITypeDef =
    | IPrimitiveDef
    | ITupleDef
    | IArrayDef
    | ISequenceDef
    | ICompositeDef
    | IVariantDef;

interface Def<T> {
    readonly def: T;
}

export type ILayout = IStructLayout | ICellLayout | IHashLayout | IArrayLayout;

export type IStructLayout = {
    readonly struct: {
        readonly fields: Array<IFieldLayout>;
    };
};

export type ICellLayout = {
    readonly cell: {
        readonly key: string;
        readonly ty: number;
    };
};

export type IArrayLayout = {
    readonly array: {
        readonly offset: string;
        readonly len: number;
        readonly cellsPerElem: number;
        readonly layout: ILayout;
    };
};

export interface IFieldLayout {
    readonly name: string | null;
    readonly layout: ILayout;
}

export interface IHashLayout {
    readonly hash: {
        readonly offset: string;
        readonly strategy: IHashingStrategy;
        readonly layout: ILayout;
    };
}

export interface IHashingStrategy {
    readonly hasher: string;
    readonly prefix: string;
    readonly postfix: string;
}

export type IPrimitiveDef = Def<{
    readonly primitive: string;
}>;

export type ITupleDef = Def<{
    readonly tuple: {
        readonly fields: Array<number>;
    };
}>;

export type IArrayDef = Def<{
    readonly array: {
        readonly len: number;
        readonly type: number;
    };
}>;

export type ISequenceDef = Def<{
    readonly sequence: {
        readonly type: number;
    };
}>;

export type ICompositeDef = Def<{
    readonly composite: {
        readonly fields: Array<IField>;
    };
    readonly path: Array<string>;
}>;

export type IVariantDef = Def<{
    readonly variants: Array<IVariant>;
    readonly path: Array<string>;
}>;

export interface IVariant {
    readonly name: string;
    readonly fields: Array<IField>;
    readonly discriminant: number | null;
}

export interface IField {
    readonly name: string | null;
    readonly type: number;
    readonly typeName: string;
}

export interface IContract {
    readonly name: string;
    readonly version: string;
    readonly authors: Array<string>;
    readonly description: string | null;
    readonly documentation: string | null;
    readonly repository: string | null;
    readonly homepage: string | null;
    readonly license: string | null;
}

export interface IContractSpec extends Docs {
    /**
     * The set of constructors of the contract.
     */
    readonly constructors: Array<IConstructorSpec>;
    /**
     * The external messages of the contract.
     */
    readonly messages: Array<IMessageSpec>;
    /**
     * The events of the contract.
     */
    readonly events: Array<IEventSpec>;
}

export interface IConstructorSpec extends NameSelectorSpec, Docs {
    /**
     * The parameters of the deploy handler.
     */
    readonly args: Array<IMessageParamSpec>;
}

export interface IMessageSpec extends NameSelectorSpec, Docs {
    /**
     * If the message is allowed to mutate the contract state.
     */
    readonly mutates: boolean;
    /**
     * If the message is payable by the caller.
     */
    readonly payable: boolean;
    /**
     * The parameters of the message.
     */
    readonly args: Array<IMessageParamSpec>;
    /**
     * The return type of the message.
     */
    readonly returnType: ITypeSpec | null;
}

export interface IEventSpec extends NameSpec, Docs {
    /**
     * The event id.
     */
    readonly id: number;
    /**
     * The event arguments.
     */
    readonly args: Array<IEventParamSpec>;
}

export interface IEventParamSpec extends NameSpec, Docs {
    /**
     * If the event parameter is indexed.
     */
    readonly indexed: boolean;
    /**
     * The type of the parameter.
     */
    readonly type: ITypeSpec;
}

export interface IMessageParamSpec extends NameSpec {
    /**
     * The type of the parameter.
     */
    readonly type: ITypeSpec;
}

export interface ITypeSpec {
    /**
     * The actual type.
     */
    readonly type: number;
    /**
     * The compile-time known displayed representation of the type.
     */
    readonly displayName: string[];
}

interface NameSelectorSpec {
    /**
     * The name of the message and some optional prefixes.
     * In case of interface provided messages and constructors the prefix
     * by convention in ask is the name of the interface.
     */
    readonly name: Array<string>;
    /**
     * The selector hash of the message.
     */
    readonly selector: string;
}

interface NameSpec {
    /**
     * The name of the parameter.
     */
    readonly name: string;
}

interface Docs {
    /**
     * The docs of the spec.
     */
    readonly docs: Array<string>;
}
