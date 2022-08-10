import * as metadata from "@ask-lang/contract-metadata";
import { Field, Type } from "visitor-as/as";

/**
 * TypeInfo contains some type infos needed for metadata types
 */
export abstract class TypeInfo {
    constructor(
        public readonly type: Type | null,
        public readonly index: number,
        public readonly kind: metadata.TypeKind
    ) {}
}

export class CompositeTypeInfo extends TypeInfo {
    constructor(
        type: Type | null,
        index: number,
        public readonly fields: Field[] | Type[]
    ) {
        super(type, index, metadata.TypeKind.Composite);
    }
}

/**
 * AssemblyScript has no native fixed array. So we define these types by hand.
 */
export class ArrayTypeInfo extends TypeInfo {
    constructor(
        type: Type,
        index: number,
        public readonly elem: Type,
        public readonly len: number
    ) {
        super(type, index, metadata.TypeKind.Array);
    }
}

/**
 * string and arrays in AssemblyScript are SequenceTypeInfo types.
 */
export class SequenceTypeInfo extends TypeInfo {
    constructor(
        type: Type,
        index: number,
        public readonly elem: Type | Type[]
    ) {
        super(type, index, metadata.TypeKind.Sequence);
    }
}

export class PrimitiveTypeInfo extends TypeInfo {
    constructor(
        type: Type,
        index: number,
        public readonly primitiveName: metadata.PrimitiveType
    ) {
        super(type, index, metadata.TypeKind.Primitive);
    }
}
