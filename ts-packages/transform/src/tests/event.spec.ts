import { newProgram, newOptions } from "assemblyscript";
import { defaultEventConfig } from "../config";
import { EventVisitor } from "../visitors";
import { checkVisitor } from "./testutil";

// Note: in tests we have to use two spaces as ident because of ASTBuilder.
function checkEventVisitor(code: string, expected: string, warn = false, error = false): void {
    const visitor = new EventVisitor(newProgram(newOptions()), defaultEventConfig());
    checkVisitor(visitor, code, expected, warn, error);
}

describe("EventVisitor", () => {
    it("parse normal @event", () => {
        const code = `
@event({ id: 1 })
class Transfer {
  @topic
  from: AccountId;
  @topic
  to: AccountId;
  value: u128;
}
`.trim();
        const expected = `
@event({
  id: 1
})
@serialize({
  omitName: true
})
@deserialize({
  omitName: true
})
class Transfer implements __lang.IEvent {
  @topic
  from: AccountId;
  @topic
  to: AccountId;
  value: u128;
  eventId(): u32 {
    return 1;
  }
}
`.trim();

        checkEventVisitor(code, expected);
    });

    it("parse inheritance @event", () => {
        const code = `
@event({ id: 2 })
class Transfer2 extends Transfer {
    @topic
    value2: u32;
    value3: u32;
}
`.trim();
        checkEventVisitor(code, "", false, true);
    });
});
