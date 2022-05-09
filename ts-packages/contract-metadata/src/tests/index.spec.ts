import { ConstructorSpec } from "..";

// TODO: add more tests
describe("Decoder", () => {
    it("ConstructorSpec", () => {
        const json = {
            label: "foo",
            selector: "0x075bcd15",
            payable: false,
            args: [],
            docs: [""],
        };

        const spec = new ConstructorSpec("foo", "0x075bcd15");
        expect(spec.toMetadata()).toStrictEqual(json);
    });
});
