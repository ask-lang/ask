import { instantiateRaw } from "as-serde-scale";
import { ISerialize, IDeserialize } from "as-serde";

/**
 * A class represents random function result.
 * 
 * Contains hash and blockNumber.
 */
@serialize({ omitName: true })
@deserialize({ omitName: true })
export class RandomResult<H, B> implements ISerialize, IDeserialize {
    constructor(
        public hash: H = instantiateRaw<H>(),
        public blockNumber: B = instantiateRaw<B>()
    ) {}
}
