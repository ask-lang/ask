import { ToMetadata } from ".";
import {
    IVariant,
    IVariantDef,
    ICompositeDef,
    ITupleDef,
    IArrayDef,
    ISequenceDef,
    IPrimitiveDef,
    IField,
    ITypeDef,
} from "./specs";

export enum TypeKind {
    Primitive = "Primitive",
    // Ask don't support Tuple
    Tuple = "Tuple",
    Array = "Array",
    // The Sequence is the array type in AssemblyScript.
    Sequence = "Sequence",
    Composite = "Composite",
    Variant = "Variant",
    // TODO:
    Compact = "Compact",
    // Ask don't support Tuple
    Phantom = "Phantom",
}

export enum PrimitiveType {
    Bool = "bool",
    Str = "str",
    I8 = "i8",
    I16 = "i16",
    I32 = "i32",
    I64 = "i64",
    I128 = "i128",
    U8 = "u8",
    U16 = "u16",
    U32 = "u32",
    U64 = "u64",
    U128 = "u128",
}
export class TypeWithId {
    constructor(public id: number, public type: Type) {}
}

export interface Type extends ToMetadata {
    typeKind(): TypeKind;

    toMetadata(): ITypeDef;
}

export class PrimitiveDef implements Type {
    // TODO: use enum?
    constructor(public readonly primitive: string) {}

    typeKind(): TypeKind {
        return TypeKind.Primitive;
    }
    toMetadata(): IPrimitiveDef {
        return {
            def: {
                primitive: this.primitive,
            },
            path: null,
        };
    }
}

export class TupleDef implements Type {
    constructor(public readonly fields: Array<number>) {}

    typeKind(): TypeKind {
        return TypeKind.Tuple;
    }

    toMetadata(): ITupleDef {
        return {
            def: {
                tuple: {
                    fields: this.fields,
                },
            },
            path: null,
        };
    }
}

export class ArrayDef implements Type {
    constructor(public readonly len: number, public readonly type: number) {}

    typeKind(): TypeKind {
        return TypeKind.Array;
    }

    toMetadata(): IArrayDef {
        return {
            def: {
                array: {
                    len: this.len,
                    type: this.type,
                },
            },
            path: null,
        };
    }
}

export class SequenceDef implements Type {
    constructor(public readonly type: number) {}

    typeKind(): TypeKind {
        return TypeKind.Sequence;
    }

    toMetadata(): ISequenceDef {
        return {
            def: {
                sequence: {
                    type: this.type,
                },
            },
            path: null,
        };
    }
}

export class CompositeDef implements Type {
    private path: Array<string> = [];
    constructor(public readonly fields: Array<Field>) {}

    setPath(path: Array<string>): this {
        this.path = path;
        return this;
    }

    typeKind(): TypeKind {
        return TypeKind.Composite;
    }
    toMetadata(): ICompositeDef {
        return {
            def: {
                composite: {
                    fields: this.fields.map((f) => f.toMetadata()),
                },
            },
            path: this.path.length > 0 ? this.path : null,
        };
    }
}

export class VariantDef implements Type {
    private path: Array<string> = [];
    constructor(public readonly variants: Array<Variant>) {}

    setPath(path: Array<string>): this {
        this.path = path;
        return this;
    }

    typeKind(): TypeKind {
        return TypeKind.Variant;
    }

    toMetadata(): IVariantDef {
        return {
            def: {
                variants: this.variants.map((v) => v.toMetadata()),
            },
            path: this.path.length > 0 ? this.path : null,
        };
    }
}

// TODO:
// export class CompactDef implements Type {
//     typeKind(): TypeKind {
//         return TypeKind.Compact;
//     }
//     toMetadata() {
//         throw new Error("Method not implemented.");
//     }
// }

// TODO:
// export class PhantomDef implements Type {
//     typeKind(): TypeKind {
//         return TypeKind.Phantom;
//     }
//     toMetadata() {
//         throw new Error("Method not implemented.");
//     }
// }

export class Variant implements ToMetadata {
    constructor(
        public readonly name: string,
        public readonly fields: Array<Field>,
        public readonly discriminant: number | null,
    ) {}

    toMetadata(): IVariant {
        return {
            name: this.name,
            fields: this.fields.map((f) => f.toMetadata()),
            discriminant: this.discriminant,
        };
    }
}

export class Field implements ToMetadata {
    constructor(
        public readonly name: string | null,
        public readonly type: number,
        public readonly typeName: string,
    ) {}

    toMetadata(): IField {
        return this;
    }
}
