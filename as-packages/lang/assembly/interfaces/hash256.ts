/**
 * An interface for Hash256 crypto encoding.
 */
export interface IHash256 {
    // Note: Make sure the result must be 256 bits bytes.
    hash<Input extends ArrayLike<u8> = Array<u8>,Output extends ArrayLike<u8> = Array<u8>> (input: Input): Output;
}
