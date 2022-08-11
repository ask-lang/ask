import { seal0, seal1, ReturnCode } from "ask-contract-runtime";
import { ScaleSerializer, ScaleDeserializer, BytesBuffer } from "as-serde-scale";
import { IEvent, IKey, TypedEnvBackend } from "../interfaces";
import { RandomResult, StorageResult } from "../types";
import { StaticBuffer } from "../internal";

// @ts-ignore
@lazy const storageBuffer = new StaticBuffer();

// TODO: Should we direct use defaultEnv?
// @ts-ignore
@inline
export function env(): EnvInstance {
    return defaultEnv;
}

// @ts-ignore
@lazy const defaultEnv: EnvInstance = new EnvInstance();

/**
 * When a message payable is false, transform will call this function to deny payment.
 * 
 * Note: Ask user do need to call this directly.
 */
export function denyPayment<B>(): void {
    // payment must be 0.
    assert(instantiate<B>() == defaultEnv.transferredBalance<B>());
}

export class EnvInstance implements TypedEnvBackend {

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() { }

    @inline
    protected getProperty<T>(
        fn: (valueBuf: u32, sizeBuf: u32) => void
    ): T {
        storageBuffer.resetBufferSize();
        fn(
            storageBuffer.bufferPtr,
            storageBuffer.sizePtr,
        );
        return ScaleDeserializer.deserialize<T>(BytesBuffer.wrap(storageBuffer.buffer));
    }

    setContractStorage<K extends IKey, V>(
        key: K,
        value: V
    ): void {
        const valBytes = ScaleSerializer.serialize<V>(value);
        seal0.seal_set_storage(
            changetype<u32>(key.toBytes()),
            changetype<u32>(valBytes),
            valBytes.length
        );
    }

    getContractStorage<K extends IKey, V>(key: K): V {
        storageBuffer.resetBufferSize();
        const code = seal0.seal_get_storage(
            changetype<u32>(key.toBytes()),
            storageBuffer.bufferPtr,
            storageBuffer.sizePtr,
        );
        assert(code == ReturnCode.Success, code.toString());

        if (!storageBuffer.isFull()) {
            return ScaleDeserializer.deserialize<V>(BytesBuffer.wrap(storageBuffer.buffer));
        } else {
            // TODO: reserve more bytes and call again getContractStorage
        }
        return unreachable();
    }

    getContractStorageResult<K extends IKey, V>(key: K): StorageResult<V> {
        storageBuffer.resetBufferSize();
        let code = seal0.seal_get_storage(
            changetype<u32>(key.toBytes()),
            storageBuffer.bufferPtr,
            storageBuffer.sizePtr,
        );

        if (code == ReturnCode.Success && !storageBuffer.isFull()) {
            return new StorageResult<V>(code, ScaleDeserializer.deserialize<V>(BytesBuffer.wrap(storageBuffer.buffer)));
        } else {
            return new StorageResult<V>(code);
        }
    }

    @inline
    clearContractStroage<K extends IKey>(key: K): void {
        seal0.seal_clear_storage(changetype<u32>(key.toBytes()));
    }

    @inline
    returnValue<V>(flags: u32, value: V): void {
        const valBytes = ScaleSerializer.serialize<V>(value);
        seal0.seal_return(flags, changetype<u32>(valBytes), valBytes.length);
    }

    @inline
    caller<A>(): A {
        return this.getProperty<A>(seal0.seal_caller);
    }

    @inline
    transferredBalance<B>(): B {
        return this.getProperty<B>(seal0.seal_value_transferred);
    }

    transfer<A, B>(dest: A, value: B): void {
        const destBytes = ScaleSerializer.serialize<A>(dest);
        const valueBytes = ScaleSerializer.serialize<B>(value);
        seal0.seal_transfer(
            changetype<u32>(destBytes),
            destBytes.length,
            changetype<u32>(valueBytes),
            valueBytes.length
        );
    }

    @inline
    gasLeft(): u64 {
        return this.getProperty<u64>(seal0.seal_gas_left);
    }

    @inline
    blockTimestamp<T>(): T {
        return this.getProperty<T>(seal0.seal_now);
    }

    @inline
    accountId<T>(): T {
        return this.getProperty<T>(seal0.seal_address);
    }

    @inline
    balance<T>(): T {
        return this.getProperty<T>(seal0.seal_balance);
    }

    @inline
    rentAllowance<T>(): T {
        return this.getProperty<T>(seal0.seal_rent_allowance);
    }

    @inline
    minimumBalance<T>(): T {
        return this.getProperty<T>(seal0.seal_minimum_balance);
    }

    @inline
    tombstoneDeposit<T>(): T {
        return this.getProperty<T>(seal0.seal_tombstone_deposit);
    }

    @inline
    blockNumber<T>(): T {
        return this.getProperty<T>(seal0.seal_block_number);
    }

    @inline
    setRentAllowance<T>(newValue: T): void {
        const bytes = ScaleSerializer.serialize<T>(newValue);
        seal0.seal_rent_allowance(changetype<u32>(bytes), bytes.length);
    }

    @inline
    terminateContract<T>(beneficiary: T): void {
        const bytes = ScaleSerializer.serialize<T>(beneficiary);
        seal1.seal_terminate(changetype<u32>(bytes));
    }

    weightToFee<T>(gas: u64): T {
        storageBuffer.resetBufferSize();
        seal0.seal_weight_to_fee(gas, storageBuffer.bufferPtr, storageBuffer.sizePtr);
        return ScaleDeserializer.deserialize<T>(BytesBuffer.wrap(storageBuffer.buffer));
    }

    emitEvent<E extends IEvent>(event: E): void {
        const id = event.eventId();
        // we use a new ScaleSerializer here
        // TODO: opt memory usage
        const serializer = new ScaleSerializer();
        serializer.serialize<u32>(id);
        const datasBytes = serializer.serialize<E>(event).toStaticArray();

        seal0.seal_deposit_event(
            0,
            0,
            changetype<u32>(datasBytes),
            datasBytes.length
        );
    }

    random<
        H,
        B,
        Input extends ArrayLike<u8> = Array<u8>,
        >(input: Input): RandomResult<H, B> {
        storageBuffer.resetBufferSize();
        if (input instanceof Array) {
            seal1.seal_random(
                changetype<u32>(input.dataStart),
                input.length,
                storageBuffer.bufferPtr,
                storageBuffer.sizePtr,
            );
        } else if (input instanceof StaticArray) {
            seal1.seal_random(
                changetype<u32>(input),
                input.length,
                storageBuffer.bufferPtr,
                storageBuffer.sizePtr,
            );
        }
        return ScaleDeserializer.deserialize<RandomResult<H, B>>(BytesBuffer.wrap(storageBuffer.buffer));
    }
}

