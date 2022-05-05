import { IEvent, IKey } from ".";
import { StorageResult, RandomResult } from "../types";

/**
 * It's backend interface for ask.
 */
export interface EnvBackend {
    /**
     * Writes the value to the contract storage under the given key.
     * @param key
     * @param value
     */
    setContractStorage<K extends IKey, V>(key: K, value: V): void;

    /**
     * Returns the value stored under the given key in the contract's storage if any.
     *
     * # Errors
     * - If the decoding of the typed value failed
     * @param key
     */
    getContractStorage<K extends IKey, V>(key: K): V;

    /**
     * Returns the value stored under the given key in the contract's storage if any.
     * Return error code if the decoding of the typed value failed.
     * @param key
     */
    getContractStorageResult<K extends IKey, V>(key: K): StorageResult<V>;

    /**
     * Clears the contract's storage key entry.
     * @param key
     */
    clearContractStroage(key: IKey): void;

    /**
     * Returns the value back to the caller of the executed contract.
     *
     * # Note
     *
     * Calling this method will end contract execution immediately.
     *  It will return the given return value back to its caller.
     *
     * The `flags` parameter can be used to revert the state changes of the
     * entire execution if necessary.
     * @param flags
     * @param value
     */
    returnValue<V>(flags: u32, value: V): void;

    // TODO: add more methods
}

/**
 * It's env type related backend interface for ask.
 */
export interface TypedEnvBackend extends EnvBackend {
    /**
     * Returns the address of the caller of the executed contract.
     */
    caller<T>(): T;

    /**
     * Returns the transferred value for the contract execution.
     */
    transferredBalance<T>(): T;

    /**
     * Returns the amount of gas left for the contract execution.
     */
    gasLeft(): u64;

    /**
     * Returns the timestamp of the current block.
     */
    blockTimestamp<T>(): T;

    /**
     * Returns the address of the executed contract.
     */
    accountId<T>(): T;

    /**
     * Returns the balance of the executed contract.
     */
    balance<T>(): T;

    /**
     * Returns the current block number.
     */
    blockNumber<T>(): T;

    /**
     * Returns the minimum balance that is required for creating an account
     * (i.e. the chain's existential deposit).
     */
    minimumBalance<T>(): T;

    /**
     * Transfers value from the contract to the destination account ID.
     * @param dest
     * @param value
     */
    transfer<A, B>(dest: A, value: B): void;

    /**
     * Emits an event with the given event data.
     * @param event
     */
    emitEvent<E extends IEvent>(event: E): void;

    /**
     * Terminates a smart contract.
     * @param beneficiary
     */
    terminateContract<T>(beneficiary: T): void;

    /**
     * Returns the price for the specified amount of gas.
     * @param gas
     */
    weightToFee<T>(gas: u64): T;

    /**
     * Returns a random hash seed.
     * @param input
     */
    random<H, B, Input extends ArrayLike<u8>>(input: Input): RandomResult<H, B>;

    // TODO: add more methods for host functions
}
