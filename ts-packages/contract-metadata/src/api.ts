import { Layout } from "./layouts";
import {
    IConstructorSpec,
    IContract,
    IContractMetadata,
    IContractSpec,
    IEventParamSpec,
    IEventSpec,
    IMessageParamSpec,
    IMessageSpec,
    IMetadataVersioned,
    ITypeSpec,
} from "./specs";
import { TypeWithId } from "./types";
import { ISource } from "./specs";
import { MetadataVersion, ToMetadata } from ".";

export class VersionedContractMetadata implements ToMetadata {
    constructor(
        private readonly contractMetadata: ContractMetadata,
        private readonly source: Source,
        private readonly contract: Contract
    ) {}

    toMetadata(): IMetadataVersioned {
        return {
            source: this.source.toMetadata(),
            contract: this.contract.toMetadata(),
            [MetadataVersion.V3]: this.contractMetadata.toMetadata(),
        };
    }
}

export class ContractMetadata implements ToMetadata {
    constructor(
        private readonly spec: ContractSpec,
        private readonly types: Array<TypeWithId>,
        private readonly storage: Layout | null,
    ) {}

    toMetadata(): IContractMetadata {
        return {
            spec: this.spec.toMetadata(),
            types: this.types.map((t) =>  {
                return {
                    id: t.id, 
                    type: t.type.toMetadata(),
                };
            }),
            storage: this.storage && this.storage.toMetadata(),
        };
    }
}

export class Source implements ToMetadata {
    constructor(
        private readonly hash: string,
        private readonly language: string,
        private readonly compiler: string
    ) {}

    toMetadata(): ISource {
        return {
            hash: this.hash,
            language: this.language,
            compiler: this.compiler,
        };
    }
}

export class Contract implements ToMetadata {
    private authors: Array<string> = [];
    private description: string | null = null;
    private documentation: string | null = null;
    private repository: string | null = null;
    private homepage: string | null = null;
    private license: string | null = null;
    constructor(private name: string, private version: string) {}

    setAuthors(authors: Array<string>): this {
        this.authors = authors;
        return this;
    }

    setDescription(description: string): this {
        this.description = description;
        return this;
    }

    setDocumentation(documentation: string): this {
        this.documentation = documentation;
        return this;
    }

    setRepository(repository: string): this {
        this.repository = repository;
        return this;
    }

    setHomepage(homepage: string): this {
        this.homepage = homepage;
        return this;
    }

    setLicense(license: string): this {
        this.license = license;
        return this;
    }

    toMetadata(): IContract {
        return {
            name: this.name,
            version: this.version,
            authors: this.authors,
            description: this.description,
            documentation: this.documentation,
            repository: this.repository,
            homepage: this.homepage,
            license: this.license,
        };
    }
}

export class ContractSpec implements ToMetadata {
    constructor(
        /// The set of constructors of the contract.
        private readonly constructors: Array<ConstructorSpec>,
        /// The external messages of the contract.
        private readonly messages: Array<MessageSpec>,
        /// The events of the contract.
        private readonly events: Array<EventSpec>,
        private readonly docs: Array<string> = [""]
    ) {}

    toMetadata(): IContractSpec {
        return {
            constructors: this.constructors.map((c) => c.toMetadata()),
            messages: this.messages.map((m) => m.toMetadata()),
            events: this.events.map((e) => e.toMetadata()),
            docs: this.docs,
        };
    }
}

export class ConstructorSpec implements ToMetadata {
    private payable = false;

    constructor(
        private readonly label: string,
        private readonly selector: string,
        private readonly args: ArgumentSpec[] = [],
        private readonly docs: string[] = []
    ) {}

    setPayable(payable = true): this {
        this.payable = payable;
        return this;
    }

    toMetadata(): IConstructorSpec {
        return {
            args: this.args.map((arg) => arg.toMetadata()),
            docs: this.docs,
            label: this.label,
            payable: this.payable,
            selector: this.selector,
        };
    }
}

export class MessageSpec implements ToMetadata {
    private mutates = false;
    private payable = false;
    constructor(
        private readonly label: string,
        private readonly selector: string,
        private readonly args: ArgumentSpec[] = [],
        private readonly returnType: TypeSpec | null = null,
        private readonly docs: string[] = []
    ) {}

    setMutates(mutates = true): this {
        this.mutates = mutates;
        return this;
    }

    setPayable(payable = true): this {
        this.payable = payable;
        return this;
    }

    toMetadata(): IMessageSpec {
        return {
            mutates: this.mutates,
            payable: this.payable,
            args: this.args.map((arg) => arg.toMetadata()),
            returnType: this.returnType?.toMetadata() || null,
            docs: this.docs,
            label: this.label,
            selector: this.selector,
        };
    }
}

export class EventSpec implements ToMetadata {
    constructor(
        public readonly id: number,
        public readonly label: string,
        private readonly args: EventParamSpec[],
        private readonly docs: string[] = [""]
    ) {}

    toMetadata(): IEventSpec {
        return {
            id: this.id,
            label: this.label,
            args: this.args.map((arg) => arg.toMetadata()),
            docs: this.docs,
        };
    }
}

export class EventParamSpec implements ToMetadata {
    constructor(
        private readonly label: string,
        private readonly type: TypeSpec,
        private readonly indexed: boolean,
        private readonly docs: string[] = [""]
    ) {}

    toMetadata(): IEventParamSpec {
        return {
            label: this.label,
            indexed: this.indexed,
            type: this.type.toMetadata(),
            docs: this.docs,
        };
    }
}

export class ArgumentSpec implements ToMetadata {
    constructor(
        private readonly type: TypeSpec,
        private readonly label: string
    ) {}

    toMetadata(): IMessageParamSpec {
        return {
            type: this.type.toMetadata(),
            label: this.label,
        };
    }
}

export class TypeSpec implements ToMetadata {
    constructor(
        private readonly type: number,
        private readonly displayName: string
    ) {}

    toMetadata(): ITypeSpec {
        return {
            type: this.type,
            displayName: [this.displayName],
        };
    }
}
