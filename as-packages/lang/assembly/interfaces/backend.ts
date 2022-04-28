import { IEvent, IKey } from ".";

export interface Env {
    env(): TypedEnvBackend;
}

/**
 * It's backend interface for ask.
 */
export interface EnvBackend {
    setContractStorage<K extends IKey, V>(key: K, value: V): void;

    getContractStorage<K extends IKey, V>(key: K): V;

    clearContractStroage(key: IKey): void;

    returnValue<V>(flags: u32, value: V): void;

    // TODO: add more methods
}

/**
 * It's env type related backend interface for ask.
 */
export interface TypedEnvBackend extends EnvBackend {
    caller<T>(): T;

    transferredBalance<T>(): T;

    gasLeft(): u64;

    blockTimestamp<T>(): T;

    accountId<T>(): T;

    balance<T>(): T;

    rentAllowance<T>(): T;

    blockNumber<T>(): T;

    minimumBalance<T>(): T;

    transfer<A, B>(dest: A, value: B): void;

    emitEvent<E extends IEvent>(event: E): void;

    terminateContract<T>(beneficiary: T): void;

    weightToFee<T>(gas: u64): T;

    // TODO: add more methods for host functions
}
