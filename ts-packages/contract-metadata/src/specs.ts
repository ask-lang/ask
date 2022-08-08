import { MetadataVersion } from ".";

/**
 * Describes a contract.
 */
export interface IContractMetadata {
    /// Describes a contract.
    readonly spec: IContractSpec;
    /// The layout of the storage data structure
    readonly storage: ILayout;
    readonly types: Array<ITypeWithIdDef>;
}

export interface IMetadataVersioned {
    readonly source: ISource;
    readonly contract: IContract;
    readonly [MetadataVersion.V3]: IContractMetadata;
}

export interface ISource {
    hash: string;
    readonly language: string;
    readonly compiler: string;
}

export type ITypeWithIdDef = {id: number, type: ITypeDef};

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

export type ILayout = IStructLayout | ICellLayout | IHashLayout | IArrayLayout | null;

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

/**
 * Describes a contract.
 */
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

/**
 * Describes a constructor of a contract.
 */
export interface IConstructorSpec extends LabelSelectorSpec, Docs {
    /**
     * If the message is payable by the caller.
     */
    readonly payable: boolean;
    /**
     * The parameters of the deploy handler.
     */
    readonly args: Array<IMessageParamSpec>;
}

/**
 * Describes a contract message.
 */

export interface IMessageSpec extends LabelSelectorSpec, Docs {
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

/**
 * Describes an event definition.
 */
export interface IEventSpec extends LabelSpec, Docs {
    /**
     * The event id.
     */
    readonly id: number;
    /**
     * The event arguments.
     */
    readonly args: Array<IEventParamSpec>;
}

/**
 *  Describes a pair of parameter label and type.
 */
export interface IEventParamSpec extends LabelSpec, Docs {
    /**
     * If the event parameter is indexed.
     */
    readonly indexed: boolean;
    /**
     * The type of the parameter.
     */
    readonly type: ITypeSpec;
}

export interface IMessageParamSpec extends LabelSpec {
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

interface LabelSelectorSpec {
    /**
     * The label of the constructor.
     * In case of a trait provided constructor the label is prefixed with the trait label.
     */
    readonly label: string;
    /**
     * The selector hash of the message.
     */
    readonly selector: string;
}

interface LabelSpec {
    /**
     * The name of the parameter.
     */
    readonly label: string;
}

interface Docs {
    /**
     * The docs of the spec.
     */
    readonly docs: Array<string>;
}
