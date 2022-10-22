/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { utils, TransformVisitor } from "visitor-as";
import { defaultConfig, AskConfig } from "../config";
import { hasDecorator, isEntry } from "../util";
import { ContractDecoratorKind, EventDeclaration } from "../ast";
import { CONFIG_NAME, LANG_LIB, LANG_LIB_PATH } from "../consts";
import { genImportStatement } from "../astutil";
import { DiagnosticMode } from "../diagnostic";
import {
    EnvTypeVisitor,
    ContractVisitor,
    EventVisitor,
    ExportEraser,
    PackedLayoutVisitor,
    SpreadLayoutVisitor,
} from ".";
import debug from "debug";
import * as fs from "fs";
import * as path from "path";
import {
    TypeDeclaration,
    Parser,
    ClassDeclaration,
    Source,
    ASTBuilder,
    FunctionDeclaration,
    Program,
    Module,
    DiagnosticCode,
} from "assemblyscript";
import { MetadataGenerator } from "../metadata/generator";

const log = debug("AskTransform");

/**
 * AskTransform is the entrypoint of all other visitors.
 */
export class AskTransform extends TransformVisitor {
    private readonly config: AskConfig;
    private readonly mode = new DiagnosticMode();
    private envReplacer!: EnvTypeVisitor;
    private parser!: Parser;
    private deployFunction: FunctionDeclaration | null = null;
    private callFunction: FunctionDeclaration | null = null;
    private hasAskDecorator = false;
    private isEntrypoint = false;
    private readonly askSources = new Map<string, Source>();
    private readonly events: Map<number, EventDeclaration> = new Map();
    private cfgPath!: string;

    constructor() {
        super();
        const defaultCfg = defaultConfig();
        // default to be cwd.
        let cfgPath = process.env["ASK_CONFIG"]
            ? process.env["ASK_CONFIG"]
            : path.join(process.cwd(), CONFIG_NAME);
        this.cfgPath = cfgPath;

        // if not exists, fallback to default config.
        if (fs.existsSync(cfgPath)) {
            log(`Read Ask config from '${cfgPath}'`);
            const cfgText = fs.readFileSync(cfgPath).toString();
            try {
                let {
                    strict,
                    env,
                    event,
                    metadataContract,
                    metadataTargetPath,
                }: AskConfig = JSON.parse(cfgText);

                strict = strict ? strict : defaultCfg.strict;
                env = env ? env : defaultCfg.env;
                event = event ? event : defaultCfg.event;

                if (metadataContract == null) {
                    metadataContract = defaultCfg.metadataContract;
                }
                this.config = {
                    strict,
                    env,
                    event,
                    metadataContract,
                    metadataTargetPath,
                };
            } catch (e) {
                throw new SyntaxError(
                    `Ask-lang: Error occurred when parse config: ${cfgPath}`
                );
            }
        } else {
            log(`Use default config`);
            this.config = defaultCfg;
        }

        log("Ask config:", this.config);
        log("Start transform process...");
    }

    private genContract(node: ClassDeclaration): ClassDeclaration {
        this.hasAskDecorator = true;
        const contractVisitor = new ContractVisitor(this.parser, this.config);
        node = contractVisitor.visitClassDeclaration(node);
        this.deployFunction = contractVisitor.deployFunction;
        this.callFunction = contractVisitor.callFunction;
        return node;
    }

    private genSpreadLayout(node: ClassDeclaration): ClassDeclaration {
        this.hasAskDecorator = true;
        const spreadLayoutVisitor = new SpreadLayoutVisitor(
            this.parser,
            this.config
        );
        node = spreadLayoutVisitor.visitClassDeclaration(node);
        return node;
    }

    private genPackedLayout(node: ClassDeclaration): ClassDeclaration {
        this.hasAskDecorator = true;
        const packedLayoutVisitor = new PackedLayoutVisitor(
            this.parser,
            this.config
        );
        node = packedLayoutVisitor.visitClassDeclaration(node);
        return node;
    }

    private genEvent(node: ClassDeclaration): ClassDeclaration {
        this.hasAskDecorator = true;
        const eventVisitor = new EventVisitor(this.parser, this.config.event!);
        node = eventVisitor.visitClassDeclaration(node);
        const id = eventVisitor.eventDeclaration.id;
        const event = this.events.get(id);
        if (!event) {
            this.events.set(id, eventVisitor.eventDeclaration);
        } else {
            this.program.errorRelated(
                DiagnosticCode.User_defined_0,
                node.range,
                event.event.range,
                `Ask-lang: Duplicated event id`
            );
        }
        return node;
    }

    visitClassDeclaration(
        node: ClassDeclaration,
        _isDefault?: boolean
    ): ClassDeclaration {
        if (hasDecorator(node.decorators, ContractDecoratorKind.Contract)) {
            node = this.genContract(node);
            node = this.genSpreadLayout(node);
        }

        if (hasDecorator(node.decorators, ContractDecoratorKind.SpreadLayout)) {
            node = this.genSpreadLayout(node);
        }

        if (hasDecorator(node.decorators, ContractDecoratorKind.PackedLayout)) {
            node = this.genPackedLayout(node);
        }

        if (hasDecorator(node.decorators, ContractDecoratorKind.Event)) {
            node = this.genEvent(node);
        }

        return node;
    }

    visitTypeDeclaration(node: TypeDeclaration): TypeDeclaration {
        if (hasDecorator(node.decorators, ContractDecoratorKind.EnvType)) {
            return this.envReplacer.visitTypeDeclaration(node);
        }
        return node;
    }

    visitSource(node: Source): Source {
        node = super.visitSource(node);
        // don't import __lang for no-ask files.
        // declare env types for ask files.
        if (this.hasAskDecorator) {
            const importAskLang = genImportStatement(
                LANG_LIB,
                LANG_LIB_PATH,
                node.range
            );
            node.statements.unshift(importAskLang);
            const whitelist = new Set<FunctionDeclaration>();
            // ask contract file maybe have not `@contract` class
            if (this.deployFunction) {
                node.statements.push(this.deployFunction);
                whitelist.add(this.deployFunction);
                this.deployFunction = null;
            }
            if (this.callFunction) {
                node.statements.push(this.callFunction);
                whitelist.add(this.callFunction);
                this.callFunction = null;
            }

            // remove all `export` for entrypoint file
            if (this.isEntrypoint) {
                this.isEntrypoint = false;
                log(
                    `'${node.normalizedPath}' is entrypoint file, trying to remove all unused export items...`
                );
                const eraser = new ExportEraser(this.program, whitelist);
                node = eraser.visitSource(node);
            }
        }
        return node;
    }

    afterParse(parser: Parser): void {
        log("Enter afterParse ...");

        // at `afterParse` phase, we do syntax tree transform and collect types info
        this.parser = parser;
        this.mode.change(this.parser);
        this.envReplacer = new EnvTypeVisitor(this.parser, this.config.env!);

        const askSources = this.askSources;
        for (let source of parser.sources) {
            // don't alter the orignal code
            source = utils.cloneNode(source);
            this.hasAskDecorator = false;
            this.isEntrypoint = isEntry(source);
            source = this.visitSource(source);
            if (this.hasAskDecorator) {
                askSources.set(source.internalPath, source);
            }
        }

        askSources.forEach((askSource) => {
            const newText = ASTBuilder.build(askSource);
            log(
                `Output a modified contract file '${askSource.normalizedPath}':`
            );
            log("\n%s", newText);
            const newParser = new Parser(parser.diagnostics);
            newParser.parseFile(
                newText,
                askSource.normalizedPath,
                isEntry(askSource)
            );
            // get new source from askSource text
            const newSource = newParser.sources.pop()!;
            updateSource(this.program, newSource);
        });

        this.mode.change(this.parser);
        log("Exit afterParse ...");
    }

    afterCompile(_module: Module): void {
        log("Enter afterCompile ...");
        this.mode.change(this.parser);

        const generator = new MetadataGenerator(
            this.program,
            this.config.metadataContract!
        );
        const metadata = generator.generate();
        log(metadata);

        const target = path.join(
            this.cfgPath,
            "..",
            this.config.metadataTargetPath
        );
        const targetDir = path.dirname(target);

        try {
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            fs.writeFileSync(
                target,
                JSON.stringify(
                    metadata,
                    (_k, v) => (v != null ? v : undefined),
                    2
                )
            );
        } catch (e) {
            console.log(
                `Error occurred when write metadata to ${this.config.metadataTargetPath}: ${e}`
            );
            throw e;
        }

        this.mode.change(this.parser);
        log("Exit afterCompile ...");
    }
}

function updateSource(program: Program, newSource: Source) {
    const sources = program.sources;
    for (let i = 0, len = sources.length; i < len; i++) {
        if (sources[i].internalPath == newSource.internalPath) {
            sources[i] = newSource;
        }
    }
}
