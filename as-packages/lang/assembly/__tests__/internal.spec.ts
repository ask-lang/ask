import { StaticBuffer } from "../internal";
import { writeBufferSize, readBufferSize } from "../internal/buffer";

describe("StaticBuffer", () => {
    it("write/read BufferSize", () => {
        let buf = new StaticArray<u8>(4);
        writeBufferSize(buf, 1023 * 1024);
        let size = readBufferSize(buf);
        expect(size).toBe(1023 * 1024);
    });

    it("is full when input max len data", () => {
        let len = 1024;
        let buf = new StaticBuffer(len);
        expect(buf.buffer.length).toBe(len);
        expect(buf.isFull()).toBeFalsy("should be empty");
        writeBufferSize(changetype<StaticArray<u8>>(buf.sizePtr), len);
        expect(buf.isFull()).toBeTruthy("Should be full");
    });
});
