import { seal0, seal1, ReturnCode } from "ask-contract-runtime";
import { ScaleSerializer, ScaleDeserializer, BytesBuffer } from "as-serde-scale";
import { IEvent, IKey, TypedEnvBackend } from "../interfaces";
import { RandomResult, StorageResult } from "../types";
import { StaticBuffer } from "../internal";

// TODO: Should we direct use defaultEnv?
// @ts-ignore
@inline
export function env(): EnvInstance {
    if (changetype<usize>(defaultEnv) == 0) {
        defaultEnv = new EnvInstance();
    }
    return defaultEnv;
}

// @ts-ignore
let defaultEnv: EnvInstance = changetype<EnvInstance>(0);

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
    storageBuffer: StaticBuffer = new StaticBuffer(0);
    private readonly scale: ScaleSerializer = new ScaleSerializer();
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() { }

    @inline
    serialize<T>(value: T): StaticArray<u8> {
        this.scale.clear();
        return this.scale.serialize<T>(value).toStaticArray();
    }
    @inline
    protected getProperty<T>(
        fn: (valueBuf: u32, sizeBuf: u32) => void
    ): T {
        this.storageBuffer.resetBufferSize();
        fn(
            this.storageBuffer.bufferPtr,
            this.storageBuffer.sizePtr,
        );
        return ScaleDeserializer.deserialize<T>(BytesBuffer.wrap(this.storageBuffer.buffer));
    }

    setContractStorage<K extends IKey, V>(
        key: K,
        value: V
    ): void {
        const valBytes = this.serialize<V>(value);
        seal0.seal_set_storage(
            changetype<u32>(key.toBytes()),
            changetype<u32>(valBytes),
            valBytes.length
        );
    }

    getContractStorage<K extends IKey, V>(key: K): V {
        this.storageBuffer.resetBufferSize();
        const code = seal0.seal_get_storage(
            changetype<u32>(key.toBytes()),
            this.storageBuffer.bufferPtr,
            this.storageBuffer.sizePtr,
        );
        assert(code == ReturnCode.Success, code.toString());

        if (!this.storageBuffer.isFull()) {
            return ScaleDeserializer.deserialize<V>(BytesBuffer.wrap(this.storageBuffer.buffer));
        } else {
            // TODO: reserve more bytes and call again getContractStorage
        }
        return unreachable();
    }

    getContractStorageResult<K extends IKey, V>(key: K): StorageResult<V> {
        this.storageBuffer.resetBufferSize();
        let code = seal0.seal_get_storage(
            changetype<u32>(key.toBytes()),
            this.storageBuffer.bufferPtr,
            this.storageBuffer.sizePtr,
        );

        if (code == ReturnCode.Success && !this.storageBuffer.isFull()) {
            return new StorageResult<V>(code, ScaleDeserializer.deserialize<V>(BytesBuffer.wrap(this.storageBuffer.buffer)));
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
        const valBytes = this.serialize<V>(value);
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
        const destBytes = this.serialize<A>(dest);
        const valueBytes = this.serialize<B>(value);
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
        const bytes = this.serialize<T>(newValue);
        seal0.seal_rent_allowance(changetype<u32>(bytes), bytes.length);
    }

    @inline
    terminateContract<T>(beneficiary: T): void {
        const bytes = this.serialize<T>(beneficiary);
        seal1.seal_terminate(changetype<u32>(bytes));
    }

    weightToFee<T>(gas: u64): T {
        this.storageBuffer.resetBufferSize();
        seal0.seal_weight_to_fee(gas, this.storageBuffer.bufferPtr, this.storageBuffer.sizePtr);
        return ScaleDeserializer.deserialize<T>(BytesBuffer.wrap(this.storageBuffer.buffer));
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
        this.storageBuffer.resetBufferSize();
        if (input instanceof Array) {
            seal1.seal_random(
                changetype<u32>(input.dataStart),
                input.length,
                this.storageBuffer.bufferPtr,
                this.storageBuffer.sizePtr,
            );
        } else if (input instanceof StaticArray) {
            seal1.seal_random(
                changetype<u32>(input),
                input.length,
                this.storageBuffer.bufferPtr,
                this.storageBuffer.sizePtr,
            );
        }
        return ScaleDeserializer.deserialize<RandomResult<H, B>>(BytesBuffer.wrap(this.storageBuffer.buffer));
    }
}

