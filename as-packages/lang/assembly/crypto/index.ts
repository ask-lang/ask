import { seal0 } from "as-contract-runtime";
import { FixedArray } from "../fixedArrays";
import { IHash128, IHash256 } from "../interfaces";

// @ts-ignore
@lazy
    const ERR_INPUT_TYPE =
    "Input type must be Array<u8>, StaticArray<u8> or FixedArray";

function invoke_hash<Output = Array<u8>>(
    inputPtr: usize,
    inputSize: i32,
    outputSize: i32,
    fn: (inputPtr: u32, inputSize: u32, outputPtr: u32) => void
): Output {
    let output: Output;
    let outputPtr: u32;
    // @ts-ignore
    if (output instanceof FixedArray) {
        output = instantiate<Output>();
        // @ts-ignore
        outputPtr = changetype<u32>(output.unwrap());
        // @ts-ignore
    } else if (output instanceof Array) {
        output = instantiate<Output>(outputSize);
        // @ts-ignore
        outputPtr = changetype<u32>(output.dataStart);
        // @ts-ignore
    } else if (output instanceof StaticArray) {
        output = instantiate<Output>(outputSize);
        // @ts-ignore
        outputPtr = changetype<u32>(output);
    } else {
        assert(false, ERR_INPUT_TYPE);
    }

    fn(
        changetype<u32>(inputPtr),
        changetype<u32>(inputSize),
        // @ts-ignore
        outputPtr
    );

    // @ts-ignore
    return output;
}

/**
 * The SHA-2 crypto hasher with an output of 256 bits.
 * @param input bytes
 * @returns
 */
export function sha2x256<
    Input extends ArrayLike<u8> = Array<u8>,
    Output extends ArrayLike<u8> = Array<u8>
>(input: Input): Output {
    return cryptoHash<Input, Output>(input, seal0.seal_hash_sha2_256);
}

/**
 * The KECCAK crypto hasher with an output of 256 bits.
 * @param input bytes
 * @returns
 */
export function keccak256<
    Input extends ArrayLike<u8> = Array<u8>,
    Output extends ArrayLike<u8> = Array<u8>
>(input: Input): Output {
    return cryptoHash<Input, Output>(input, seal0.seal_hash_keccak_256);
}

/**
 * The BLAKE-2 crypto hasher with an output of 256 bits.
 * @param input bytes
 * @returns
 */
export function blake2x256<
    Input extends ArrayLike<u8> = Array<u8>,
    Output extends ArrayLike<u8> = Array<u8>
>(input: Input): Output {
    return cryptoHash<Input, Output>(input, seal0.seal_hash_blake2_256);
}

/**
 * The BLAKE-2 crypto hasher with an output of 128 bits.
 * @param input bytes
 * @returns
 */
export function blake2x128<
    Input extends ArrayLike<u8> = Array<u8>,
    Output extends ArrayLike<u8> = Array<u8>
>(input: Input): Output {
    return cryptoHash<Input, Output>(input, seal0.seal_hash_blake2_128, 16);
}

function cryptoHash<
    Input extends ArrayLike<u8> = Array<u8>,
    Output extends ArrayLike<u8> = Array<u8>
>(
    input: Input,
    hash: (inputPtr: u32, inputSize: u32, outputPtr: u32) => void,
    outputSize: u32 = 32
    // @ts-ignore
): Output {
    if (input instanceof FixedArray) {
        return invoke_hash<Output>(
            changetype<u32>(input.unwrap()),
            input.length,
            outputSize,
            hash
        );
    } else if (input instanceof Array) {
        return invoke_hash<Output>(
            changetype<u32>(input.dataStart),
            input.length,
            outputSize,
            hash
        );
    } else if (input instanceof StaticArray) {
        return invoke_hash<Output>(
            changetype<u32>(input),
            // @ts-ignore
            input.length,
            outputSize,
            hash
        );
    } else {
        assert(false, ERR_INPUT_TYPE);
    }
}

/**
 * The KECCAK crypto hasher with an output of 256 bits.
 */
export class HashKeccak256 implements IHash256 {
    length: u32 = 32;

    hash<
        Input extends ArrayLike<u8> = Array<u8>,
        Output extends ArrayLike<u8> = Array<u8>
    >(input: Input): Output {
        return keccak256<Input, Output>(input);
    }
}

/**
 * The SHA-2 crypto hasher with an output of 256 bits.
 */
export class HashSha2x256 implements IHash256 {
    length: u32 = 32;

    hash<
        Input extends ArrayLike<u8> = Array<u8>,
        Output extends ArrayLike<u8> = Array<u8>
    >(input: Input): Output {
        return sha2x256<Input, Output>(input);
    }
}

/**
 * The BLAKE-2 crypto hasher with an output of 256 bits.
 */
export class HashBlake2x256 implements IHash256 {
    length: u32 = 32;

    hash<
        Input extends ArrayLike<u8> = Array<u8>,
        Output extends ArrayLike<u8> = Array<u8>
    >(input: Input): Output {
        return blake2x256<Input, Output>(input);
    }
}

/**
 * The BLAKE-2 crypto hasher with an output of 128 bits.
 */
export class HashBlake2x128 implements IHash128 {
    length: u32 = 16;

    hash<
        Input extends ArrayLike<u8> = Array<u8>,
        Output extends ArrayLike<u8> = Array<u8>
    >(input: Input): Output {
        return blake2x128<Input, Output>(input);
    }
}
