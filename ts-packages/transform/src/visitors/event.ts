import _ from "lodash";
import { SimpleParser, TransformVisitor } from "visitor-as";
import {
    ClassDeclaration,
    DiagnosticEmitter,
    FieldDeclaration,
    MethodDeclaration,
    DiagnosticCode,
    NodeKind,
    CommonFlags,
} from "assemblyscript/dist/assemblyscript.js";
import { EventDeclaration } from "../ast.js";
import { EventConfig } from "../config.js";
import { addSerializeDecorator, addDeserializeDecorator, addImplement } from "../astutil/index.js";
import { IEVENT_TYPE_PATH } from "../consts.js";

const METHOD_EVENT_ID = "eventId";

/**
 * EventVisitor traversal `@event` class and implements Event interface for it. The fields must be scale types.
 * Note: Don't reuse a visitor if you have not reset the inner state.
 */
export class EventVisitor extends TransformVisitor {
    // TODO: design topic
    private topicNum = 0;
    private eventId: number | null = null;
    private hasBase: bool = false;
    private topics: FieldDeclaration[] = [];
    private data: FieldDeclaration[] = [];
    public eventDeclaration!: EventDeclaration;

    constructor(public readonly emitter: DiagnosticEmitter, public readonly config: EventConfig) {
        super();
    }

    visitClassDeclaration(node: ClassDeclaration): ClassDeclaration {
        if (node.typeParameters) {
            this.emitter.errorRelated(
                DiagnosticCode.User_defined_0,
                node.range,
                node.name.range,
                `Ask-lang: '@event' cannot be a generic class`,
            );
        }
        node = super.visitClassDeclaration(node);

        const eventDecl = EventDeclaration.extractFrom(this.emitter, node);
        this.eventDeclaration = eventDecl;
        this.eventId = eventDecl.id;
        this.hasBase = node.extendsType ? true : false;

        // TODO: Event do not support `extends` this time because of ink design
        if (this.hasBase) {
            this.emitter.errorRelated(
                DiagnosticCode.User_defined_0,
                node.range,
                node.name.range,
                `Ask-lang: '@event' do not support 'extends' this time`,
            );
        }
        this.visit(node.members);
        this.data = _.uniqBy(this.data, (data) => data.range.toString());
        this.topics = _.uniqBy(this.topics, (topic) => topic.range.toString());
        node.members.push(...this.genEvent(node));
        addSerializeDecorator(node);
        addDeserializeDecorator(node);
        if (!this.hasBase) {
            addImplement(node, IEVENT_TYPE_PATH);
        }
        return node;
    }

    visitFieldDeclaration(node: FieldDeclaration): FieldDeclaration {
        // ignore static fields
        if (node.is(CommonFlags.Static)) {
            return node;
        }
        this.visitNonTopicField(node);

        // const decorator = extractDecorator(
        //     this.emitter,
        //     node,
        //     ContractDecoratorKind.Topic
        // );

        // if (decorator != null) {
        //      // @topic field
        //      this.visitTopicField(node, decorator);
        // } else {
        //      non-@topic field
        //      this.visitNonTopicField(node);
        // }

        return node;
    }

    /**
     *
     * @returns Return current number of found topic field
     */
    getTopicNum(): number {
        return this.topicNum;
    }

    // TODO: design a better topic for events
    // private visitTopicField(
    //     node: FieldDeclaration,
    //     decorator: DecoratorNode
    // ): void {
    //     this.topicNum++;
    //     if (this.topicNum - 1 === this.config.maxTopicNum) {
    //         this.emitter.error(
    //             DiagnosticCode.User_defined_0,
    //             node.range,
    //             `Ask-lang: The number of topics exceeds the upper limit of ${this.config.maxTopicNum}`
    //         );
    //     }
    //     // do syntax checking
    //     shouldBeNoParamDecorator(this.emitter, decorator);
    //     this.topics.push(node);
    //     this.data.push(node);
    // }

    private visitNonTopicField(node: FieldDeclaration): void {
        this.data.push(node);
    }

    private genEvent(node: ClassDeclaration): MethodDeclaration[] {
        const res = [this.genEventId(node)];
        return res;
    }

    private genEventId(clz: ClassDeclaration): MethodDeclaration {
        // TODO: use u8 for compatible with ink!
        const methodDecl = `${METHOD_EVENT_ID}(): u32 { return ${this.eventId}; }`;
        const methodNode = SimpleParser.parseClassMember(methodDecl, clz);
        assert(methodNode.kind == NodeKind.MethodDeclaration);
        return methodNode as MethodDeclaration;
    }
}
