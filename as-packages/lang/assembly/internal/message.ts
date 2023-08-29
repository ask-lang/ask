import { BytesBuffer, ScaleDeserializer } from "as-serde-scale";
import { StaticBuffer } from ".";
import { IMessage } from "../interfaces/message";

// A global static buffer for storing transaction message or host function io.
const GLOBAL_BUFFER = new StaticBuffer();
// Selector is 4 bytes.
const SELECTOR_BUFFER_SIZE: i32 = 4;

/**
 * Message represents a contract call data from request.
 *
 * It's internal used by ask-transform.
 */
export class Message implements IMessage {
    // This contains input first 4 bytes as selector.
    private readonly selector: StaticArray<u8>;

    // The rest bytes for message args.
    @unsafe
    private readonly argsBytes: BytesBuffer;

    // TODO: add fillFromEnv method instead of constructor
    constructor() {
        const selector = new StaticArray<u8>(SELECTOR_BUFFER_SIZE);
        GLOBAL_BUFFER.input();

        memory.copy(
            changetype<usize>(selector),
            changetype<usize>(GLOBAL_BUFFER.bufferPtr),
            SELECTOR_BUFFER_SIZE,
        );
        const argsBytes = BytesBuffer.wrap(GLOBAL_BUFFER.buffer);
        argsBytes.resetReadOffset(SELECTOR_BUFFER_SIZE);

        this.selector = selector;
        this.argsBytes = argsBytes;
    }

    /**
     * Determine whether the message is the call of the selector
     * @param selector 4 Bytes array
     * @returns
     */
    isSelector(selector: StaticArray<u8>): bool {
        // @ts-ignore
        if (this.selector.length != selector.length) {
            return false;
        }
        return this._isSelector(selector);
    }

    private _isSelector(selector: StaticArray<u8>): bool {
        return (
            memory.compare(
                changetype<usize>(this.selector),
                changetype<usize>(selector),
                SELECTOR_BUFFER_SIZE,
            ) == 0
        );
    }

    /**
     * Consume part of message argument bytes and return the decoded SCALE type value.
     *
     * Panic occurs when bytes are consumed out of index.
     * @returns arg value
     */
    getArg<T>(): T {
        return ScaleDeserializer.deserialize<T>(this.argsBytes);
    }
}
