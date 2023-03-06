import {
    env,
    BlockNumber,
    RandomResult,
    FixedArray16,
    FixedArray32,
    blake2x256,
    blake2x128,
    keccak256,
    sha2x256,
    Hash,
} from "ask-lang";

@contract
export class Contract {
    constructor() {}

    @constructor()
    default(): void {}

    @message()
    blake2x256(input: Array<u8>): FixedArray32<u8> {
        return blake2x256<Array<u8>, FixedArray32<u8>>(input);
    }

    @message()
    blake2x128(input: Array<u8>): FixedArray16<u8> {
        return blake2x128<Array<u8>, FixedArray16<u8>>(input);
    }

    @message()
    keccak256(input: Array<u8>): StaticArray<u8> {
        return keccak256<Array<u8>, StaticArray<u8>>(input);
    }

    @message()
    sha2x256(input: Array<u8>): FixedArray32<u8> {
        return sha2x256<Array<u8>, FixedArray32<u8>>(input);
    }
}
