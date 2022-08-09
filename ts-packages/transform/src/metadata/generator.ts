/* eslint-disable @typescript-eslint/ban-types */

import {
    Program,
    FunctionPrototype,
    ElementKind,
    ClassPrototype,
    Element,
    SourceKind,
    MethodDeclaration,
    NodeKind,
    FieldDeclaration,
    Function,
    Field,
    Class,
    ClassDeclaration,
    DiagnosticCode,
} from "assemblyscript";
import { version } from "visitor-as/as";
import {
    ArgumentSpec,
    ContractMetadata,
    ContractSpec,
    Source,
    MessageSpec,
    TypeSpec,
    PrimitiveDef,
    Contract,
    IMetadataVersioned,
    CompositeDef,
    ConstructorSpec,
    EventSpec,
    EventParamSpec,
    SequenceDef,
    ArrayDef,
    VersionedContractMetadata,
} from "@ask-lang/contract-metadata";
import * as metadata from "@ask-lang/contract-metadata";
import { ASK_VERSION } from "../consts";
import {
    extractConfigFromDecorator,
    extractDecorator,
    hasDecorator,
} from "../util";
import {
    ContractDecoratorKind,
    MessageDeclaration,
    ConstructorDeclaration,
    EventDeclaration,
} from "../ast";
import {
    TypeResolver,
    PrimitiveTypeInfo,
    CompositeTypeInfo,
    SequenceTypeInfo,
    TypeInfoMap,
} from ".";
import debug from "debug";
import { uniqBy } from "lodash";
import { ArrayTypeInfo } from "./typeInfo";

export const LANGUAGE = `Ask! ${ASK_VERSION}`;
export const COMPILER = `asc ${version}`;

const log = debug("MetadataGenerator");

export class MetadataGenerator {
    private entrypoint!: ClassPrototype;
    private events: ClassPrototype[] = [];

    constructor(
        public readonly program: Program,
        public readonly contractConfig: metadata.IContract
    ) {
        program.elementsByName.forEach((elem) => {
            if (isEntrypointContract(elem)) {
                this.entrypoint = elem as ClassPrototype;
                return;
            } else if (isEvent(elem)) {
                const event = elem as ClassPrototype;
                this.events.push(event);
            }
        });
        assert(
            this.entrypoint != null,
            "Cannot find a `@contract` class in entry file"
        );
    }

    generate(): IMetadataVersioned {
        const resolver = new TypeResolver(
            this.program,
            this.entrypoint,
            this.events
        );
        resolver.resolve();
        // TODO: fill the hash after wasm codegen
        const source = new Source("", LANGUAGE, COMPILER);
        let cfg = this.contractConfig;
        const contract = new Contract(cfg.name, cfg.version);
        contract.setAuthors(cfg.authors);

        if (cfg.description) {
            contract.setDescription(cfg.description);
        }

        if (cfg.repository) {
            contract.setRepository(cfg.repository);
        }

        if (cfg.license) {
            contract.setLicense(cfg.license);
        }

        if (cfg.documentation) {
            contract.setDocumentation(cfg.documentation);
        }

        if (cfg.homepage) {
            contract.setHomepage(cfg.homepage);
        }

        const spec = this.genSpec(resolver);
        const types = this.genTypes(resolver);
        // TODO:
        const metadata = new ContractMetadata(
            spec,
            types,
            null,
        );

        let versioned = new VersionedContractMetadata(
            metadata,
            source,
            contract
        );

        return versioned.toMetadata();
    }

    private genSpec(resolver: TypeResolver): ContractSpec {
        log(this.genSpec.name);
        const msgSpecs = this.genMessages(resolver);
        const constructorSpecs = this.genConstructors(resolver);
        const events = this.genEvents(resolver);
        // TODO:
        const contractSpec = new ContractSpec(
            constructorSpecs,
            msgSpecs,
            events
        );
        return contractSpec;
    }

    private genTypes(resolver: TypeResolver): metadata.TypeWithId[] {
        log(this.genTypes.name);
        const typeSpecs: metadata.TypeWithId[] = [];
        const types = resolver.resolvedTypes();
        types.forEach((info) => {
            // TODO: support other types
            switch (info.kind) {
                case metadata.TypeKind.Primitive: {
                    const typeInfo = info as PrimitiveTypeInfo;
                    const def = new PrimitiveDef(typeInfo.primitiveName);
                    typeSpecs[info.index] = new metadata.TypeWithId(info.index, def);
                    break;
                }

                case metadata.TypeKind.Array: {
                    const typeInfo = info as ArrayTypeInfo;
                    const def = new ArrayDef(
                        typeInfo.len,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        types.get(typeInfo.elem)!.index
                    );
                    typeSpecs[info.index] = new metadata.TypeWithId(info.index, def);
                    break;
                }

                case metadata.TypeKind.Sequence: {
                    const typeInfo = info as SequenceTypeInfo;
                    const elem = typeInfo.elem;
                    if (elem instanceof Array) {
                        // CompositeTypeInfo that are unnamed fields

                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const unamedTypeInfo = types.get(elem)!;
                        assert(unamedTypeInfo != null);
                        assert(
                            unamedTypeInfo.kind == metadata.TypeKind.Composite,
                            `Ask-lang: unamed type is not a composite type`
                        );
                        let ty = new metadata.TypeWithId(unamedTypeInfo.index, this.genCompositeType(
                            resolver,
                            unamedTypeInfo as CompositeTypeInfo
                        ));
                        typeSpecs[unamedTypeInfo.index] = ty;
                        const def = new SequenceDef(unamedTypeInfo.index);
                        typeSpecs[info.index] = new metadata.TypeWithId(info.index, def);
                    } else {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const def = new SequenceDef(types.get(elem)!.index);
                        typeSpecs[info.index] = new metadata.TypeWithId(info.index, def);
                    }
                    break;
                }

                case metadata.TypeKind.Composite: {
                    const def = this.genCompositeType(
                        resolver,
                        info as CompositeTypeInfo
                    );
                    typeSpecs[info.index] = new metadata.TypeWithId(info.index, def);
                    break;
                }

                default: {
                    assert(
                        false,
                        `Ask-lang: unspported type kind in metadata: ${info.kind}`
                    );
                }
            }
        });
        // type index is starting from 1
        // typeSpecs.splice(0, 1);
        return typeSpecs;
    }

    private genCompositeType(
        resolver: TypeResolver,
        info: CompositeTypeInfo
    ): CompositeDef {
        assert(
            info.fields.length > 0,
            `Ask-lang: Composite def ${info.type?.toString()} fields are empty`
        );
        const types = resolver.resolvedTypes();
        const fields: metadata.Field[] = info.fields.map((field) => {
            // field is named
            if (field instanceof Field) {
                const fieldDecl = field.prototype
                    .declaration as FieldDeclaration;
                const fieldTypeInfo = types.get(field.type);
                assert(
                    fieldTypeInfo != null,
                    `Ask-lang: '${
                        field.name
                    }: ${field.type.toString()}' not found`
                );
                const ret = new metadata.Field(
                    fieldDecl.name.range.toString(),
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    fieldTypeInfo!.index,
                    // we make sure all fields gived a type explicitly
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    fieldDecl.type!.range.toString()
                );
                return ret;
            } else {
                // type is unnamed
                const fieldTypeInfo = types.get(field);
                assert(
                    fieldTypeInfo != null,
                    `Ask-lang: type '${field.toString()}' not found`
                );
                const ret = new metadata.Field(
                    null,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    fieldTypeInfo!.index,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    field.toString()
                );
                return ret;
            }
        });
        let path = info.type ? info.type.toString() : "unknown";
        return new CompositeDef(fields).setPath([path]);
    }

    private genMessages(resolver: TypeResolver): MessageSpec[] {
        log(this.genMessages.name);

        const types = resolver.resolvedTypes();
        const messages = resolver.messages;
        const msgSpecs: MessageSpec[] = [];
        messages.forEach((func, name) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const decorator = extractDecorator(
                this.program,
                func.declaration,
                ContractDecoratorKind.Message
            )!;
            log(name, decorator.range.toString());
            const cfg = extractConfigFromDecorator(this.program, decorator);
            assert(
                func.prototype.declaration.kind == NodeKind.METHODDECLARATION
            );
            const msgDecl = MessageDeclaration.extractFrom(
                this.program,
                func.prototype.declaration as MethodDeclaration,
                cfg
            );

            const args = this.getFuncArgumentSpecs(types, func);

            const functionTypeNode = func.prototype.functionTypeNode;
            const returnType = func.signature.returnType;
            const returnTypeNode = functionTypeNode.returnType;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            // when return type is void, we cannot find the type.
            const typeInfo = types.get(returnType);
            let returnTypeSpec: TypeSpec | null = null;
            if (typeInfo) {
                returnTypeSpec = new TypeSpec(
                    typeInfo.index,
                    returnTypeNode.range.toString()
                );
            }

            const spec = new MessageSpec(
                name,
                msgDecl.hexSelector(),
                args,
                returnTypeSpec
            );
            spec.setMutates(msgDecl.mutates);
            spec.setPayable(msgDecl.payable);
            msgSpecs.push(spec);
        });

        return msgSpecs;
    }

    private genConstructors(resolver: TypeResolver): ConstructorSpec[] {
        log(this.genConstructors.name);
        const types = resolver.resolvedTypes();
        const constructors = resolver.constructors;
        const constructorSpecs: ConstructorSpec[] = [];
        constructors.forEach((func, name) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const decorator = extractDecorator(
                this.program,
                func.declaration,
                ContractDecoratorKind.Constructor
            )!;
            log(name, decorator.range.toString());
            const cfg = extractConfigFromDecorator(this.program, decorator);
            assert(
                func.prototype.declaration.kind == NodeKind.METHODDECLARATION
            );
            const decl = ConstructorDeclaration.extractFrom(
                this.program,
                func.prototype.declaration as MethodDeclaration,
                cfg
            );

            const args = this.getFuncArgumentSpecs(types, func);
            // constructor have no return type
            const spec = new ConstructorSpec(name, decl.hexSelector(), args);
            constructorSpecs.push(spec);
        });

        return constructorSpecs;
    }

    private genEvents(resolver: TypeResolver): EventSpec[] {
        log(`Start ${this.genEvents.name}`);
        const events = resolver.events;
        const eventSpecs: EventSpec[] = [];
        events.forEach((event, _internalName) => {
            const eventSpec = this.genEventSpec(
                resolver.resolvedTypes(),
                event
            );

            eventSpecs.push(eventSpec);
        });

        log(`End ${this.genEvents.name}`);

        const uniqEvents = uniqBy(eventSpecs, (event) => event.id);
        // TODO: check duplicated id
        if (eventSpecs.length != uniqEvents.length) {
            this.program.error(
                DiagnosticCode.User_defined_0,
                null,
                `Some event ids are duplicated`
            );
        }
        return eventSpecs;
    }

    private genEventSpec(types: TypeInfoMap, event: Class): EventSpec {
        log(`Start ${this.genEventSpec.name}: ${event.name}`);
        const args: EventParamSpec[] = [];
        const eventDecl = event.prototype.declaration as ClassDeclaration;
        const eventId = EventDeclaration.extractFrom(
            this.program,
            eventDecl
        ).id;

        // we need to keep args in order.
        log(eventDecl.members.map((member) => member.name.text));
        eventDecl.members.forEach((member) => {
            if (member.kind != NodeKind.FIELDDECLARATION) {
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const field = event.members!.get(member.name.text)! as Field;
            assert(field != null);
            const fieldDecl = field.declaration as FieldDeclaration;
            const indexed: boolean = extractDecorator(
                this.program,
                fieldDecl,
                ContractDecoratorKind.Topic
            )
                ? true
                : false;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const typeInfo = types.get(field.type)!;
            const typeSpec = new TypeSpec(
                typeInfo.index,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                fieldDecl.type!.range.toString()
            );
            args.push(new EventParamSpec(field.name, typeSpec, indexed));
        });

        log(`End ${this.genEventSpec.name}: ${event.name}`);
        return new EventSpec(eventId, event.name, args);
    }

    private getFuncArgumentSpecs(
        types: TypeInfoMap,
        func: Function
    ): ArgumentSpec[] {
        const args: ArgumentSpec[] = [];
        const parameterTypes = func.signature.parameterTypes;
        const functionTypeNode = func.prototype.functionTypeNode;
        const parameterNodes = functionTypeNode.parameters;
        for (let i = 0; i < parameterTypes.length; i++) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const typeInfo = types.get(parameterTypes[i])!;
            assert(
                typeInfo,
                `${parameterNodes[i].name.text} typeInfo must be existed`
            );
            const argName = parameterNodes[i].name.range.toString();
            const typeName = parameterNodes[i].type.range.toString();
            const typeSpec = new TypeSpec(typeInfo.index, typeName);
            const arg = new ArgumentSpec(typeSpec, argName);
            args.push(arg);
        }
        return args;
    }
}

/**
 * Find the entrypoint contract, we begin analysis from entrypoint
 * @param elem
 * @returns
 */
export function isEntrypointContract(elem: Element): boolean {
    const prototype = <ClassPrototype>elem;
    return (
        prototype.declaration.range.source.sourceKind ==
            SourceKind.USER_ENTRY && isContract(elem)
    );
}

export function isContract(elem: Element): boolean {
    return isClass(elem, ContractDecoratorKind.Contract);
}

export function isConstructor(elem: Element): boolean {
    return isMethod(elem, ContractDecoratorKind.Constructor);
}

export function isMessage(elem: Element): boolean {
    return isMethod(elem, ContractDecoratorKind.Message);
}

export function isEvent(elem: Element): boolean {
    return isClass(elem, ContractDecoratorKind.Event);
}

function isClass(elem: Element, kind: ContractDecoratorKind): boolean {
    if (elem.kind == ElementKind.CLASS_PROTOTYPE) {
        const prototype = <ClassPrototype>elem;
        return hasDecorator(prototype.declaration.decorators, kind);
    }
    return false;
}

function isMethod(elem: Element, kind: ContractDecoratorKind): boolean {
    if (elem.kind == ElementKind.FUNCTION_PROTOTYPE) {
        const prototype = <FunctionPrototype>elem;
        return hasDecorator(prototype.declaration.decorators, kind);
    }
    return false;
}
