export interface IHash {
    length: u32;

    hash<
        Input extends ArrayLike<u8> = Array<u8>,
        Output extends ArrayLike<u8> = Array<u8>
    >(
        input: Input
    ): Output;
}

/**
 * An interface for Hash256 crypto encoding.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IHash256 extends IHash {}

/**
 * An interface for Hash128 crypto encoding.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IHash128 extends IHash {}
