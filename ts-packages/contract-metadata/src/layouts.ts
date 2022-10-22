import { ToMetadata } from "./index";
import { IHashLayout, IArrayLayout, ILayout } from "./specs";
import { IFieldLayout, IStructLayout, ICellLayout, IHashingStrategy } from "./specs";

export enum LayoutKind {
    Cell,
    Hash,
    Array,
    Struct,
    // TODO: make sure the semantics
    Enum,
}

export enum CryptoHasher {
    /// The BLAKE-2 crypto hasher with an output of 256 bits.
    Blake2x256 = "Blake2x256",
    /// The SHA-2 crypto hasher with an output of 256 bits.
    Sha2x256 = "Sha2x256",
    /// The KECCAK crypto hasher with an output of 256 bits.
    Keccak256 = "Keccak256",
}

export interface Layout extends ToMetadata {
    layoutKind(): LayoutKind;

    toMetadata(): ILayout;
}

export class StructLayout implements Layout {
    constructor(public readonly fields: Array<FieldLayout>) {}

    layoutKind(): LayoutKind {
        return LayoutKind.Struct;
    }

    toMetadata(): IStructLayout {
        return {
            struct: {
                fields: this.fields.map((f) => f.toMetadata()),
            },
        };
    }
}

export class FieldLayout implements ToMetadata {
    constructor(
        /// The name of the field.
        ///
        /// Can be missing, e.g. in case of an enum tuple struct variant.
        public readonly name: string | null,
        /// The kind of the field.
        ///
        /// This is either a direct layout bound
        /// or another recursive layout sub-struct.
        public readonly layout: Layout
    ) {}

    toMetadata(): IFieldLayout {
        return {
            name: this.name,
            layout: this.layout.toMetadata(),
        };
    }
}

export class HashingStrategy implements ToMetadata {
    constructor(
        public readonly hasher: CryptoHasher,
        public readonly prefix: string,
        public readonly postfix: string
    ) {}

    public toMetadata(): IHashingStrategy {
        return {
            hasher: this.hasher.toString(),
            prefix: this.prefix,
            postfix: this.prefix,
        };
    }
}

export type LayoutKey = string;

export class CellLayout implements Layout {
    constructor(public readonly key: LayoutKey, public readonly ty: number) {}

    layoutKind(): LayoutKind {
        return LayoutKind.Cell;
    }
    public toMetadata(): ICellLayout {
        return {
            cell: {
                key: this.key,
                ty: this.ty,
            },
        };
    }
}

export class HashLayout implements Layout {
    constructor(
        public readonly offset: LayoutKey,
        public readonly strategy: HashingStrategy,
        public readonly layout: Layout
    ) {}

    public layoutKind(): LayoutKind {
        return LayoutKind.Hash;
    }

    public toMetadata(): IHashLayout {
        return {
            hash: {
                offset: this.offset,
                strategy: this.strategy.toMetadata(),
                layout: this.layout.toMetadata(),
            },
        };
    }
}

export class ArrayLayout implements Layout {
    constructor(
        /// The offset key of the array layout.
        ///
        /// This is the same key as the element at index 0 of the array layout.
        public readonly offset: LayoutKey,
        public readonly len: number,
        public readonly cellsPerElem: number,
        public readonly layout: Layout
    ) {}

    public layoutKind(): LayoutKind {
        return LayoutKind.Array;
    }

    public toMetadata(): IArrayLayout {
        return {
            array: {
                offset: this.offset.toString(),
                len: this.len,
                cellsPerElem: this.cellsPerElem,
                layout: this.layout.toMetadata(),
            },
        };
    }
}
