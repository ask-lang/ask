/* eslint-disable @typescript-eslint/ban-types */
import debug from "debug";
import { PrimitiveType } from "ask-contract-metadata";
import {
    ClassPrototype,
    FunctionPrototype,
    Class,
    Type,
    ElementKind,
    // Field,
    NodeKind,
    ClassDeclaration,
    CommonFlags,
    Function,
    Program,
    CommonNames,
    DeclaredElement,
    PropertyPrototype,
    Property,
} from "assemblyscript/dist/assemblyscript.js";
import {
    isMessage,
    isConstructor,
    PrimitiveTypeInfo,
    CompositeTypeInfo,
    TypeInfo,
    ArrayTypeInfo,
    SequenceTypeInfo,
} from "./index.js";

const log = debug("TypeResolver");

export type TypeInfoMap = Map<Type | Type[], TypeInfo>;

/**
 * TypeResolver resolve an entrypoint contract type infos, and collect some useful type infos.
 */
export class TypeResolver {
    // Note: the index is started from zero.
    private currentIndex = 0;
    // Visited types
    // Note: all types occurred in metadata are classes(including primitive type, because we use Bool/UInt32 ...)
    private readonly types: TypeInfoMap = new Map();
    public readonly contracts: ClassPrototype[] = [];
    public readonly messages: Map<string, Function> = new Map();
    public readonly constructors: Map<string, Function> = new Map();
    public readonly events: Map<string, Class> = new Map();

    constructor(
        public readonly program: Program,
        private readonly entrypoint: ClassPrototype,
        private readonly eventPrototypes: ClassPrototype[],
    ) {}

    /**
     *
     * @returns Resovled types
     */
    resolvedTypes(): TypeInfoMap {
        return this.types;
    }

    resolve(): void {
        let curContract: ClassPrototype | null = this.entrypoint;
        do {
            this.contracts.push(curContract);
            curContract = curContract.basePrototype;
        } while (curContract != null);
        this.resolveContracts(this.contracts);
        this.resolveEvents(this.eventPrototypes);
        // TODO: resolve storages
    }

    private resolveContracts(contracts: ClassPrototype[]) {
        contracts.forEach((contract, index) => {
            // first one is entrypoint
            this.resolveContract(contract, index === 0);
        });
    }

    private resolveEvents(events: ClassPrototype[]) {
        events.forEach((event) => {
            this.resolveEvent(event);
        });
    }

    /**
     * Add the type to types. If the type is not primitive type, add it non-static fields recursively in order.
     * @param type resolved type
     * @returns
     */
    private resolveScaleType(type: Type) {
        assert(type.isFunction == false, `Ask-lang don't support fucntion as a scale type`);
        log(`resolveCodecType: ${type.toString()}`);
        if (this.types.has(type)) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion

        // reach the primitive type (leaf type node)
        let typeName: PrimitiveType | null = null;
        switch (type) {
            default:
                // It's unsupported primitive type.
                assert(
                    type.getClass() != null,
                    `Ask-lang: '${type.toString()}' type is not supported`,
                );
                break;
            case Type.bool:
                typeName = PrimitiveType.Bool;
                break;
            case Type.u8:
                typeName = PrimitiveType.U8;
                break;
            case Type.u16:
                typeName = PrimitiveType.U16;
                break;
            case Type.u32:
                typeName = PrimitiveType.U32;
                break;
            case Type.u64:
                typeName = PrimitiveType.U64;
                break;
            case Type.i8:
                typeName = PrimitiveType.I8;
                break;
            case Type.i16:
                typeName = PrimitiveType.I16;
                break;
            case Type.i32:
                typeName = PrimitiveType.I32;
                break;
            case Type.i64:
                typeName = PrimitiveType.I64;
                break;
        }
        if (typeName) {
            const typeInfo = new PrimitiveTypeInfo(type, this.currentIndex++, typeName);
            this.types.set(type, typeInfo);
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const clz: Class = type.getClass()!;

        assert(clz != null, `Ask-lang: non-primitive type must be a class: ${type.toString()}`);

        const program = this.program;

        // TODO: we could define a decorator to catch this type.
        // It's other primitive type
        if (
            clz.prototype.internalName.match(/~lib\/as-bignum/) &&
            (clz.prototype.name === PrimitiveType.I128 || clz.prototype.name === PrimitiveType.U128)
        ) {
            log(`Meet as-binum: ${clz.prototype.internalName}`);
            const typeInfo = new PrimitiveTypeInfo(type, this.currentIndex++, clz.prototype.name);
            this.types.set(type, typeInfo);
        }
        // It's array type
        else if (
            clz.prototype.internalName.match(/~lib\/ask-lang/) &&
            (clz.prototype.name === "FixedArray8" ||
                clz.prototype.name === "FixedArray16" ||
                clz.prototype.name === "FixedArray32" ||
                clz.prototype.name === "FixedArray64" ||
                clz.prototype.name === "FixedArray128" ||
                false)
        ) {
            const typeArgs = clz.typeArguments;
            log(`Meet FixedArray type: ${clz.toString()}`);
            if (typeArgs) {
                assert(typeArgs.length == 1, `Ask-lang: array type must only have one elem type`);
                this.resolveScaleType(typeArgs[0]);
                this.types.set(
                    type,
                    new ArrayTypeInfo(
                        type,
                        this.currentIndex++,
                        typeArgs[0],
                        +clz.prototype.name.slice("FixedArray".length),
                    ),
                );
            }
        }
        // It's str primitive type
        else if (
            clz == program.stringInstance ||
            clz == this.errorInstance ||
            // all error types are regard as string
            clz.base == this.errorInstance ||
            false
        ) {
            // AS string as a `str`
            this.resolveScaleType(Type.u8);
            this.types.set(
                type,
                new PrimitiveTypeInfo(type, this.currentIndex++, PrimitiveType.Str),
            );
        }
        // It's sequence type
        else if (clz.prototype == program.uint8ArrayPrototype) {
            this.resolveScaleType(Type.u8);
            this.types.set(type, new SequenceTypeInfo(type, this.currentIndex++, Type.u8));
        } else if (clz.prototype == program.uint16ArrayPrototype) {
            this.resolveScaleType(Type.u16);
            this.types.set(type, new SequenceTypeInfo(type, this.currentIndex++, Type.u16));
        } else if (clz.prototype == program.uint32ArrayPrototype) {
            this.resolveScaleType(Type.u32);
            this.types.set(type, new SequenceTypeInfo(type, this.currentIndex++, Type.u32));
        } else if (clz.prototype == program.uint64ArrayPrototype) {
            this.resolveScaleType(Type.u64);
            this.types.set(type, new SequenceTypeInfo(type, this.currentIndex++, Type.u64));
        } else if (clz.prototype == program.int8ArrayPrototype) {
            this.resolveScaleType(Type.i8);
            this.types.set(type, new SequenceTypeInfo(type, this.currentIndex++, Type.i8));
        } else if (clz.prototype == program.int16ArrayPrototype) {
            this.resolveScaleType(Type.i16);
            this.types.set(type, new SequenceTypeInfo(type, this.currentIndex++, Type.i16));
        } else if (clz.prototype == program.int32ArrayPrototype) {
            this.resolveScaleType(Type.i32);
            this.types.set(type, new SequenceTypeInfo(type, this.currentIndex++, Type.i32));
        } else if (clz.prototype == program.int64ArrayPrototype) {
            this.resolveScaleType(Type.i64);
            this.types.set(type, new SequenceTypeInfo(type, this.currentIndex++, Type.i64));
        } else if (
            clz.prototype == program.arrayPrototype ||
            clz.prototype == program.staticArrayPrototype ||
            clz.prototype == program.setPrototype
        ) {
            const typeArgs = clz.typeArguments ? clz.typeArguments : [];
            assert(typeArgs.length == 1, `Ask-lang: sequence type must only have one elem type`);

            // TODO: consider nullable type
            // typeArgs[0].nullableType
            // log(`${typeArgs[0].toString()} ${typeArgs[0].is(TypeFlags.NULLABLE)}`);
            this.resolveScaleType(typeArgs[0]);
            this.types.set(type, new SequenceTypeInfo(type, this.currentIndex++, typeArgs[0]));
        } else if (clz.prototype == program.mapPrototype) {
            // It's very special.
            const typeArgs = clz.typeArguments ? clz.typeArguments : [];
            assert(
                typeArgs.length == 2,
                `Ask-lang: map (sequence) type must only have two elem type`,
            );
            this.resolveScaleType(typeArgs[0]);
            this.resolveScaleType(typeArgs[1]);
            // unamed new type
            const newTypeInfo = new CompositeTypeInfo(null, this.currentIndex++, typeArgs);
            this.types.set(typeArgs, newTypeInfo);
            this.types.set(type, new SequenceTypeInfo(clz.type, this.currentIndex++, typeArgs));
        } else if (clz.isArrayLike) {
            const typeArgs = clz.typeArguments;
            log(`Meet ArrayLike type: ${clz.toString()}`);
            if (typeArgs) {
                assert(
                    typeArgs.length == 1,
                    `Ask-lang: sequence type must only have one elem type`,
                );
                this.resolveScaleType(typeArgs[0]);
                this.types.set(type, new SequenceTypeInfo(type, this.currentIndex++, typeArgs[0]));
            }
        } else {
            // It's composite type
            const fields = this.resovleCompositeField(type);
            this.types.set(type, new CompositeTypeInfo(type, this.currentIndex++, fields));
        }
    }

    private resovleCompositeField(type: Type): Type[] {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const clz: Class = type.getClass()!;
        assert(clz.declaration.kind === NodeKind.ClassDeclaration);
        const fields: Type[] = [];
        for (let curClass: Class | null = clz; curClass != null; curClass = curClass.base) {
            const decl = curClass.declaration as ClassDeclaration;
            for (let i = decl.members.length - 1; i >= 0; i--) {
                let member = decl.members[i];
                // we only need to know non-static field type
                if (member.isAny(CommonFlags.Static)) {
                    continue;
                }
                if (member.kind != NodeKind.FieldDeclaration) {
                    continue;
                }
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const elem = curClass!.members!.get(member.name.text)!;
                assert(elem != null);
                if (!TypeResolver.isPropertyField(elem)) {
                    continue;
                }
                let elemType = TypeResolver.getPropertyFieldType(elem);
                this.resolveScaleType(elemType);
                fields.push(elemType);
                // const field = elem as Field;
                // this.resolveScaleType(field.type);
                // fields.push(field);
            }
        }
        // we need to keep the field order.
        fields.reverse();
        return fields;
    }

    get errorInstance(): Class {
        var cached = this._errorInstance;
        if (!cached) this._errorInstance = cached = this.program.requireClass(CommonNames.Error);
        return cached;
    }
    private _errorInstance: Class | null = null;

    private resolveContract(contract: ClassPrototype, isEntry: boolean) {
        log(`Start ${this.resolveContract.name}: ${contract.name}`);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const instances: Map<string, Class> = contract.instances!;
        assert(instances != null, `${contract.declaration.name.text} has instances`);
        assert(
            instances.size === 1,
            `${contract.declaration.name.text} should only have one instance`,
        );

        let instance: Class = getFirstValue(instances);
        assert(instance.declaration.kind === NodeKind.ClassDeclaration);

        log(instance.members?.keys());
        // TODO: do some filterings for contract inheritance
        instance.members?.forEach((member, name) => {
            const decl = contract.declaration as ClassDeclaration;
            // we only collect members occured in current class but not in super class.
            if (!decl.members.includes(member.declaration)) {
                return;
            }
            if (isMessage(member)) {
                log("message method:", name, member.internalName);
                const func = member as FunctionPrototype;
                assert(func.instances?.size == 1);
                func.instances?.forEach((member) => {
                    const signature = member.signature;
                    signature.parameterTypes.forEach((ty) => {
                        this.resolveScaleType(ty);
                    });
                    if (signature.returnType != Type.void) {
                        this.resolveScaleType(signature.returnType);
                    }
                    if (!this.messages.has(name)) {
                        this.messages.set(name, member);
                    }
                });
            } else if (isConstructor(member) && isEntry) {
                // Only support entrypoint
                log("constructor method:", name);
                const func = member as FunctionPrototype;
                assert(func.instances?.size == 1, `instances num: ${func.instances?.size}`);
                func.instances?.forEach((member) => {
                    const signature = member.signature;
                    signature.parameterTypes.forEach((ty) => {
                        this.resolveScaleType(ty);
                    });
                    assert(
                        signature.returnType.getClass() == null,
                        `@constructor ${name} return type must be void`,
                    );
                    // TODO: check duplicated
                    if (!this.constructors.has(name)) {
                        this.constructors.set(name, member);
                    }
                });
            } else if (TypeResolver.isPropertyField(member)) {
                // TODO: now don't support storage metadata
            }
        });
        log(`End ${this.resolveContract.name}: ${contract.name}`);
    }

    static isPropertyPrototype(clz: DeclaredElement): bool {
        return clz.kind === ElementKind.PropertyPrototype;
    }

    static isPropertyField(clz: DeclaredElement): bool {
        return TypeResolver.isPropertyPrototype(clz) && (clz as PropertyPrototype).isField;
    }

    /**
     * Get the field instance from the element property.
     *
     * It assumes the field instance exists.
     * @param element The element in a class.
     * @returns
     */
    static getPropertyField(element: DeclaredElement): Property {
        return (element as PropertyPrototype).instance as Property;
    }

    /**
     * Get the field instance type from the element property.
     *
     * It assumes the field instance exists.
     * @param element The element in a class.
     * @returns
     */
    static getPropertyFieldType(element: DeclaredElement): Type {
        return TypeResolver.getPropertyField(element).type;
    }

    private resolveEvent(event: ClassPrototype) {
        log(`Start ${this.resolveEvent.name}: ${event.name}`);
        // Normally, we only have one instance for one kind event.
        event.instances?.forEach((instance: Class) => {
            log(instance.members?.keys());
            instance.members?.forEach((member, name) => {
                if (!TypeResolver.isPropertyField(member)) {
                    return;
                }
                log("event field:", name);
                let memberType = TypeResolver.getPropertyFieldType(member);
                this.resolveScaleType(memberType);
            });

            this.events.set(instance.internalName, instance);
        });
        log(`End ${this.resolveEvent.name}: ${event.name}`);
    }
}

function getFirstValue<K, V>(map: Map<K, V>): V {
    assert(map.size > 0);
    let v!: V;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    for (const v of map.values()) {
        return v;
    }
    return v;
}
