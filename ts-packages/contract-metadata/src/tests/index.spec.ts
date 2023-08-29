import * as assert from "assert";
import { ConstructorSpec, MessageSpec, TypeSpec } from "../index.js";

// TODO: add more tests
describe("Decoder", () => {
    it("ConstructorSpec", () => {
        const json = {
            label: "foo",
            selector: "0x075bcd15",
            payable: false,
            args: [],
            docs: [],
        };

        const spec = new ConstructorSpec("foo", "0x075bcd15");
        assert.deepStrictEqual(spec.toMetadata(), json);
    });

    it("MessageSpec", () => {
        const json = {
            args: [],
            docs: [],
            label: "total_supply",
            mutates: false,
            payable: false,
            returnType: {
                displayName: ["Balance"],
                type: 0,
            },
            selector: "0xdb6375a8",
        };

        const returnTypeSpec = new TypeSpec(0, "Balance");
        const spec = new MessageSpec("total_supply", "0xdb6375a8", [], returnTypeSpec);
        assert.deepStrictEqual(spec.toMetadata(), json);
    });
});
