import { hexSelector } from "../ast";

describe("hexSelector", () => {
    it("selector should be blake2-256", () => {
        let cases = [
            ["new", "0x9bae9d5e"],
            ["default", "0xed4b9d1b"],
            ["flip", "0x633aa551"],
            ["get", "0x2f865bd9"],
        ];

        for (let c of cases) {
            let res = hexSelector(null, c[0]);
            expect(res).toBe(c[1]);
        }
    });
});
