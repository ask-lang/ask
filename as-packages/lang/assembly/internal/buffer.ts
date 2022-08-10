import { seal0 } from "@ask-lang/as-contract-runtime";

// TODO: we need support larger input data
export let STORAGE_BUFFER_SIZE: i32 = 1024;

/**
 * StaticBuffer is used to push/pull storage and encode/decode scale value from input message.
 */
export class StaticBuffer {
    /**
     * The default buffer size is 16 KB.
     */
    static readonly DEFAULT_BUFFER_SIZE: u32 = 1024 * 16;

    /**
     * The four bytes for storing `size` value.
     * 
     * When be reset, it means the buffer size.
     * When be set by host function, it means the used buffer size.
     */
    private readonly _sizePtr: StaticArray<u8> = new StaticArray<u8>(4);
    @unsafe
    readonly buffer: StaticArray<u8>;

    constructor(bufferSize: u32 = StaticBuffer.DEFAULT_BUFFER_SIZE) {
        this.buffer = new StaticArray<u8>(bufferSize as i32);
    }

    input(): void {
        this.resetBufferSize();
        seal0.seal_input(this.bufferPtr, this.sizePtr);
    }

    /**
     * Reset altered buffer size value to the inner buffer actual size.
     * @param size
     */
    @inline
    resetBufferSize(size: u32 = this.buffer.length): void {
        writeBufferSize(this._sizePtr, size);
    }

    /**
     * Return true if size buffer value is equal to inner buffer length.
     * It's used to determine that should StaticBuffer expand memory size.
     * @returns
     */
    @inline
    isFull(): bool {
        return readBufferSize(this._sizePtr) == (this.buffer.length as u32);
    }

    /**
     * Return the pointer of size Buffer.
     */
    @unsafe
    @inline
    get sizePtr(): u32 {
        return changetype<u32>(this._sizePtr);
    }

    /**
     * Return the pointer of content buffer.
     */
    @unsafe
    @inline
    get bufferPtr(): u32 {
        return changetype<u32>(this.buffer);
    }

    // TODO:
    // expand(size: i32): void {
    //     this.buffer = changetype<StaticArray<u8>>(
    //         __renew(
    //             changetype<usize>(this.buffer),
    //             StaticBuffer.DEFAULT_BUFFER_SIZE
    //         )
    //     );
    // }
}

export function writeBufferSize(buf: StaticArray<u8>, size: u32): void {
    for (let i = 0; i < 4; i++) {
        buf[i] = ((size >> (i * 8)) & 0xff) as u8;
    }
}

export function readBufferSize(buf: StaticArray<u8>): u32 {
    let v: u32 = 0;
    for (let i = 3; i >= 0; i--) {
        v = ((buf[i] as u32) << (i * 8)) | v;
    }
    return v;
}
