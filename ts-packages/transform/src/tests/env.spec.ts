/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { newOptions, newProgram } from "visitor-as/as";
import { EnvConfig, defaultEnvConfig } from "../config";
import { EnvTypeVisitor } from "../visitors";
import { checkVisitor } from "./testutil";

export function testEnvConfig(): EnvConfig {
    return defaultEnvConfig();
}

describe("EnvTypeVisitor", () => {
    it("replace types according to config", () => {
        const code = `
@envType
type AccountId = A;
@envType
type Balance = B;
@envType
type Timestamp = T;
@envType
type BlockNumber = N;
`.trim();
        const expected = `
@envType
type AccountId = __lang.AccountId;
@envType
type Balance = __lang.Balance;
@envType
type Timestamp = __lang.Timestamp;
@envType
type BlockNumber = __lang.BlockNumber;
  `.trim();
        const visitor = new EnvTypeVisitor(
            newProgram(newOptions()),
            testEnvConfig()
        );
        checkVisitor(visitor, code, expected);
    });

    it("replace a illegal type", () => {
        const code = `
@envType
type Account = A;
`.trim();
        const visitor = new EnvTypeVisitor(
            newProgram(newOptions()),
            testEnvConfig()
        );
        checkVisitor(visitor, code, "", false, true);
    });
});
