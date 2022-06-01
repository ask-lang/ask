import { Ptr, ReturnCode, Size } from ".";

export * from "./unstable";


// Set the value at the given key in the contract storage.
//
// Equivalent to the newer version of `seal_set_storage` with the exception of the return
// type. Still a valid thing to call when not interested in the return value.
// @ts-ignore
@external("seal0", "seal_set_storage")
export declare function seal_set_storage(
    keyPtr: Ptr,
    valuePtr: Ptr,
    valueSize: Size
): void;

// Clear the value at the given key in the contract storage.
//
// Equivalent to the newer version of `seal_clear_storage` with the exception of the return
// type. Still a valid thing to call when not interested in the return value.
// @ts-ignore
@external("seal0", "seal_clear_storage")
export declare function seal_clear_storage(keyPtr: Ptr): void;

// Retrieve the value under the given key from storage.
//
// # Parameters
//
// - `key_ptr`: pointer into the linear memory where the key of the requested value is placed.
// - `out_ptr`: pointer to the linear memory where the value is written to.
// - `out_len_ptr`: in-out pointer into linear memory where the buffer length
//   is read from and the value length is written to.
//
// # Errors
//
// `ReturnCode::KeyNotFound`
// @ts-ignore
@external("seal0", "seal_get_storage")
export declare function seal_get_storage(
    keyPtr: Ptr,
    outPtr: Ptr,
    outSizePtr: Ptr
): ReturnCode;

// Transfer some value to another account.
//
// # Parameters
//
// - account_ptr: a pointer to the address of the beneficiary account
//   Should be decodable as an `T::AccountId`. Traps otherwise.
// - account_len: length of the address buffer.
// - value_ptr: a pointer to the buffer with value, how much value to send.
//   Should be decodable as a `T::Balance`. Traps otherwise.
// - value_len: length of the value buffer.
//
// # Errors
//
// `ReturnCode::BelowSubsistenceThreshold`
// `ReturnCode::TransferFailed`
// @ts-ignore
@external("seal0", "seal_transfer")
export declare function seal_transfer(
    accountPtr: Ptr,
    accountSize: Size,
    valuePtr: Ptr,
    valueSize: Size
): ReturnCode;

// Make a call to another contract.
//
// The callees output buffer is copied to `output_ptr` and its length to `output_len_ptr`.
// The copy of the output buffer can be skipped by supplying the sentinel value
// of `u32::max_value()` to `output_ptr`.
//
// # Parameters
//
// - callee_ptr: a pointer to the address of the callee contract.
//   Should be decodable as an `T::AccountId`. Traps otherwise.
// - callee_len: length of the address buffer.
// - gas: how much gas to devote to the execution.
// - value_ptr: a pointer to the buffer with value, how much value to send.
//   Should be decodable as a `T::Balance`. Traps otherwise.
// - value_len: length of the value buffer.
// - input_data_ptr: a pointer to a buffer to be used as input data to the callee.
// - input_data_len: length of the input data buffer.
// - output_ptr: a pointer where the output buffer is copied to.
// - output_len_ptr: in-out pointer to where the length of the buffer is read from
//   and the actual length is written to.
//
// # Errors
//
// An error means that the call wasn't successful output buffer is returned unless
// stated otherwise.
//
// `ReturnCode::CalleeReverted`: Output buffer is returned.
// `ReturnCode::CalleeTrapped`
// `ReturnCode::BelowSubsistenceThreshold`
// `ReturnCode::TransferFailed`
// `ReturnCode::NotCallable`
// @ts-ignore
@external("seal0", "seal_call")
export declare function seal_call(
    calleePtr: Ptr,
    calleeSize: Size,
    gas: u64,
    valuePtr: Ptr,
    valueSize: Size,
    inputDataPtr: Ptr,
    inputDataSize: Size,
    outputPtr: Ptr,
    outputLenPtr: Ptr
): ReturnCode;

// Execute code in the context (storage, caller, value) of the current contract.
//
// Reentrancy protection is always disabled since the callee is allowed
// to modify the callers storage. This makes going through a reentrancy attack
// unnecessary for the callee when it wants to exploit the caller.
//
// # Parameters
//
// - flags: See [`CallFlags`] for a documentation of the supported flags.
// - code_hash: a pointer to the hash of the code to be called.
// - input_data_ptr: a pointer to a buffer to be used as input data to the callee.
// - input_data_len: length of the input data buffer.
// - output_ptr: a pointer where the output buffer is copied to.
// - output_len_ptr: in-out pointer to where the length of the buffer is read from
//   and the actual length is written to.
//
// # Errors
//
// An error means that the call wasn't successful and no output buffer is returned unless
// stated otherwise.
//
// `ReturnCode::CalleeReverted`: Output buffer is returned.
// `ReturnCode::CalleeTrapped`
// `ReturnCode::CodeNotFound`
// @ts-ignore
@external("seal0", "seal_delegate_call")
export declare function seal_delegate_call(
    flags: u32,
    code_hash_ptr: Ptr,
    input_data_ptr: Ptr,
    input_data_len: Size,
    output_ptr: Ptr,
    output_len_ptr: Ptr,
): ReturnCode;

// Instantiate a contract with the specified code hash.
//
// # Deprecation
//
// This is equivalent to calling the newer version of this function. The newer version
// drops the now unnecessary length fields.
//
// # Note
//
// The values `_code_hash_len` and `_value_len` are ignored because the encoded sizes
// of those types are fixed through `[`MaxEncodedLen`]. The fields exist for backwards
// compatibility. Consider switching to the newest version of this function.
// @ts-ignore
@external("seal0", "seal_instantiate")
export declare function seal_instantiate(
    codeHashPtr: Ptr,
    _codeHashSize: Size,
    gas: u64,
    valuePtr: Ptr,
    _valueSize: Size,
    inputDataPtr: Ptr,
    inputDataLen: Size,
    addressPtr: Ptr,
    addressLenPtr: Ptr,
    outputPtr: Ptr,
    outputLenPtr: Ptr,
    saltPtr: Ptr,
    saltLen: Size,
): ReturnCode;

// Remove the calling account and transfer remaining balance.
//
// # Deprecation
//
// This is equivalent to calling the newer version of this function. The newer version
// drops the now unnecessary length fields.
//
// # Note
//
// The value `_beneficiary_len` is ignored because the encoded sizes
// this type is fixed through `[`MaxEncodedLen`]. The field exist for backwards
// compatibility. Consider switching to the newest version of this function.
// @ts-ignore
@external("seal0", "seal_terminate")
export declare function seal_terminate(
    beneficiaryPtr: Ptr,
    _beneficiaryLen: Size
): void;

// Read message's input from host.
// @ts-ignore
@external("seal0", "seal_input")
export declare function seal_input(bufPtr: Ptr, bufLenPtr: Ptr): void;

// Cease contract execution and save a data buffer as a result of the execution.
//
// This function never returns as it stops execution of the caller.
// This is the only way to return a data buffer to the caller. Returning from
// execution without calling this function is equivalent to calling:
// ```
// seal_return(0, 0, 0);
// ```
//
// The flags argument is a bitfield that can be used to signal special return
// conditions to the supervisor:
// --- lsb ---
// bit 0      : REVERT - Revert all storage changes made by the caller.
// bit [1, 31]: Reserved for future use.
// --- msb ---
//
// Using a reserved bit triggers a trap.
// @ts-ignore
@external("seal0", "seal_return")
export declare function seal_return(
    flags: u32,
    dataPtr: Ptr,
    dataSize: Size
): void;

// Stores the address of the caller into the supplied buffer.
//
// The value is stored to linear memory at the address pointed to by `outPtr`.
// `outLenPtr` must point to a u32 value that describes the available space at
// `outPtr`. This call overwrites it with the size of the value. If the available
// space at `outPtr` is less than the size of the value a trap is triggered.
//
// If this is a top-level call (i.e. initiated by an extrinsic) the origin address of the
// extrinsic will be returned. Otherwise, if this call is initiated by another contract then the
// address of the contract will be returned. The value is encoded as T::AccountId.
// @ts-ignore
@external("seal0", "seal_caller")
export declare function seal_caller(outPtr: Ptr, outLenPtr: Ptr): void;

// Checks whether a specified address belongs to a contract.
//
// # Parameters
//
// - account_ptr: a pointer to the address of the beneficiary account
//   Should be decodable as an `T::AccountId`. Traps otherwise.
//
// Returned value is a u32-encoded boolean: (0 = false, 1 = true).
// @ts-ignore
@external("seal0", "seal_is_contract")
export declare function seal_is_contract(accountPtr: Ptr): u32;

// Retrieve the code hash for a specified contract address.
//
// # Parameters
//
// - `account_ptr`: a pointer to the address in question.
//   Should be decodable as an `T::AccountId`. Traps otherwise.
// - `out_ptr`: pointer to the linear memory where the returning value is written to.
// - `out_len_ptr`: in-out pointer into linear memory where the buffer length
//   is read from and the value length is written to.
//
// # Errors
//
// `ReturnCode::KeyNotFound`
// @ts-ignore
@external("seal0", "seal_code_hash")
export declare function seal_code_hash(accountPtr: Ptr, outPtr: Ptr, outLenPtr: Ptr): ReturnCode;


// Retrieve the code hash of the currently executing contract.
//
// # Parameters
//
// - `out_ptr`: pointer to the linear memory where the returning value is written to.
// - `out_len_ptr`: in-out pointer into linear memory where the buffer length
//   is read from and the value length is written to.
// @ts-ignore
@external("seal0", "seal_own_code_hash")
export declare function seal_own_code_hash(accountPtr: Ptr, outLenPtr: Ptr): void;

// Replace the contract code at the specified address with new code.
//
// # Note
//
// There are a couple of important considerations which must be taken into account when
// using this API:
//
// 1. The storage at the code address will remain untouched. This means that contract developers
// must ensure that the storage layout of the new code is compatible with that of the old code.
//
// 2. Contracts using this API can't be assumed as having deterministic addresses. Said another way,
// when using this API you lose the guarantee that an address always identifies a specific code hash.
//
// 3. If a contract calls into itself after changing its code the new call would use
// the new code. However, if the original caller panics after returning from the sub call it
// would revert the changes made by `seal_set_code_hash` and the next caller would use
// the old code.
//
// # Parameters
//
// - `code_hash_ptr`: A pointer to the buffer that contains the new code hash.
//
// # Errors
//
// `ReturnCode::CodeNotFound`
// @ts-ignore
@external("seal0", "seal_set_code_hash")
export declare function seal_set_code_hash(codeHashPtr: Ptr): u32;

// Checks whether the caller of the current contract is the origin of the whole call stack.
//
// Prefer this over `seal_is_contract` when checking whether your contract is being called by a contract
// or a plain account. The reason is that it performs better since it does not need to
// do any storage lookups.
//
// A return value of`true` indicates that this contract is being called by a plain account
// and `false` indicates that the caller is another contract.
//
// Returned value is a u32-encoded boolean: (0 = false, 1 = true).
// @ts-ignore
@external("seal0", "seal_caller_is_origin")
export declare function seal_caller_is_origin(): u32;

// Stores the address of the current contract into the supplied buffer.
//
// The value is stored to linear memory at the address pointed to by `outPtr`.
// `outLenPtr` must point to a u32 value that describes the available space at
// `outPtr`. This call overwrites it with the size of the value. If the available
// space at `outPtr` is less than the size of the value a trap is triggered.
// @ts-ignore
@external("seal0", "seal_address")
export declare function seal_address(outPtr: Ptr, outLenPtr: Ptr): void;

// Stores the price for the specified amount of gas into the supplied buffer.
//
// The value is stored to linear memory at the address pointed to by `outPtr`.
// `outLenPtr` must point to a u32 value that describes the available space at
// `outPtr`. This call overwrites it with the size of the value. If the available
// space at `outPtr` is less than the size of the value a trap is triggered.
//
// The data is encoded as T::Balance.
//
// # Note
//
// It is recommended to avoid specifying very small values for `gas` as the prices for a single
// gas can be smaller than one.
// @ts-ignore
@external("seal0", "seal_weight_to_fee")
export declare function seal_weight_to_fee(
    gas: u64,
    outPtr: Ptr,
    outLenPtr: Ptr
): void;
// Stores the amount of gas left into the supplied buffer.
//
// The value is stored to linear memory at the address pointed to by `outPtr`.
// `outLenPtr` must point to a u32 value that describes the available space at
// `outPtr`. This call overwrites it with the size of the value. If the available
// space at `outPtr` is less than the size of the value a trap is triggered.
//
// The data is encoded as Gas.
// @ts-ignore
@external("seal0", "seal_gas_left")
export declare function seal_gas_left(outPtr: Ptr, outLenPtr: Ptr): void;

// Stores the balance of the current account into the supplied buffer.
//
// The value is stored to linear memory at the address pointed to by `outPtr`.
// `outLenPtr` must point to a u32 value that describes the available space at
// `outPtr`. This call overwrites it with the size of the value. If the available
// space at `outPtr` is less than the size of the value a trap is triggered.
//
// The data is encoded as T::Balance.
// @ts-ignore
@external("seal0", "seal_balance")
export declare function seal_balance(outPtr: Ptr, outLenPtr: Ptr): void;

// Stores a random number for the current block and the given subject into the supplied buffer.
//
// The value is stored to linear memory at the address pointed to by `out_ptr`.
// `out_len_ptr` must point to a u32 value that describes the available space at
// `out_ptr`. This call overwrites it with the size of the value. If the available
// space at `out_ptr` is less than the size of the value a trap is triggered.
//
// The data is encoded as T::Hash.
//
// # Deprecation
//
// This function is deprecated. Users should migrate to the version in the "seal1" module.
// @ts-ignore
@external("seal0", "seal_random")
export declare function seal_random(
    subjectPtr: Ptr,
    subjectLen: Size,
    outPtr: Ptr,
    outLenPtr: Ptr
): void;

// Stores the value transferred along with this call or as endowment into the supplied buffer.
//
// The value is stored to linear memory at the address pointed to by `outPtr`.
// `outLenPtr` must point to a u32 value that describes the available space at
// `outPtr`. This call overwrites it with the size of the value. If the available
// space at `outPtr` is less than the size of the value a trap is triggered.
//
// The data is encoded as T::Balance.
// @ts-ignore
@external("seal0", "seal_value_transferred")
export declare function seal_value_transferred(
    outPtr: Ptr,
    outLenPtr: Ptr
): void;

// Load the latest block timestamp into the supplied buffer
//
// The value is stored to linear memory at the address pointed to by `outPtr`.
// `outLenPtr` must point to a u32 value that describes the available space at
// `outPtr`. This call overwrites it with the size of the value. If the available
// space at `outPtr` is less than the size of the value a trap is triggered.
// @ts-ignore
@external("seal0", "seal_now")
export declare function seal_now(outPtr: Ptr, outLenPtr: Ptr): void;

// Stores the minimum balance (a.k.a. existential deposit) into the supplied buffer.
//
// The data is encoded as T::Balance.
// @ts-ignore
@external("seal0", "seal_minimum_balance")
export declare function seal_minimum_balance(outPtr: Ptr, outLenPtr: Ptr): void;

// Stores the tombstone deposit into the supplied buffer.
//
// The value is stored to linear memory at the address pointed to by `out_ptr`.
// `out_len_ptr` must point to a u32 value that describes the available space at
// `out_ptr`. This call overwrites it with the size of the value. If the available
// space at `out_ptr` is less than the size of the value a trap is triggered.
//
// # Deprecation
//
// There is no longer a tombstone deposit. This function always returns 0.
// @ts-ignore
@external("seal0", "seal_tombstone_deposit")
export declare function seal_tombstone_deposit(
    outPtr: Ptr,
    outLenPtr: Ptr
): void;

// Try to restore the given destination contract sacrificing the caller.
//
// This export declare function will compute a tombstone hash from the caller's storage and the given code hash
// and if the hash matches the hash found in the tombstone at the specified address - kill
// the caller contract and restore the destination contract and set the specified `rent_allowance`.
// All caller's funds are transfered to the destination.
//
// If there is no tombstone at the destination address, the hashes don't match or this contract
// instance is already present on the contract call stack, a trap is generated.
//
// Otherwise, the destination contract is restored. This export declare function is diverging and stops execution
// even on success.
//
// `dest_ptr`, `dest_len` - the pointer and the length of a buffer that encodes `T::AccountId`
// with the address of the to be restored contract.
// `code_hash_ptr`, `code_hash_len` - the pointer and the length of a buffer that encodes
// a code hash of the to be restored contract.
// `rent_allowance_ptr`, `rent_allowance_len` - the pointer and the length of a buffer that
// encodes the rent allowance that must be set in the case of successful restoration.
// `delta_ptr` is the pointer to the start of a buffer that has `delta_count` storage keys
// laid out sequentially.
//
// # Traps
//
// - Tombstone hashes do not match
// - Calling cantract is live i.e is already on the call stack.
// @ts-ignore
@external("seal0", "seal_restore_to")
export declare function seal_restore_to(
    destPtr: Ptr,
    destSize: Size,
    codeHashPtr: Ptr,
    codeHashSize: Size,
    rentAllowancePtr: Ptr,
    rentAllowanceSize: Size,
    deltaPtr: Ptr,
    deltaCount: Size
): void;

// Deposit a contract event with the data buffer and optional list of topics. There is a limit
// on the maximum number of topics specified by `event_topics`.
//
// - topicsPtr - a pointer to the buffer of topics encoded as `Vec<T::Hash>`. The value of this
//   is ignored if `topicsLen` is set to 0. The topics list can't contain duplicates.
// - topicsLen - the length of the topics buffer. Pass 0 if you want to pass an empty vector.
// - dataPtr - a pointer to a raw data buffer which will saved along the event.
// - dataLen - the length of the data buffer.
// @ts-ignore
@external("seal0", "seal_deposit_event")
export declare function seal_deposit_event(
    topicsPtr: Ptr,
    topicsLen: Size,
    dataPtr: Ptr,
    dataLen: Size
): void;

// Set rent allowance of the contract.
//
// # Deprecation
//
// This is equivalent to calling the newer version of this function. The newer version
// drops the now unnecessary length fields.
//
// # Note
//
// The value `_VALUE_len` is ignored because the encoded sizes
// this type is fixed through `[`MaxEncodedLen`]. The field exist for backwards
// compatibility. Consider switching to the newest version of this function.
// @ts-ignore
@external("seal0", "seal_set_rent_allowance")
export declare function seal_set_rent_allowance(
    valuePtr: Ptr,
    valueLen: Size
): void;


// Derpeacted
// @ts-ignore
@external("seal0", "seal_rent_allowance")
export declare function seal_rent_allowance(outPtr: Ptr, outLenPtr: Ptr): void;

// Stores the current block number of the current contract into the supplied buffer.
//
// The value is stored to linear memory at the address pointed to by `outPtr`.
// `outLenPtr` must point to a u32 value that describes the available space at
// `outPtr`. This call overwrites it with the size of the value. If the available
// space at `outPtr` is less than the size of the value a trap is triggered.
// @ts-ignore
@external("seal0", "seal_block_number")
export declare function seal_block_number(outPtr: Ptr, outLenPtr: Ptr): void;

// Computes the SHA2 256-bit hash on the given input buffer.
//
// Returns the result directly into the given output buffer.
//
// # Note
//
// - The `input` and `output` buffer may overlap.
// - The output buffer is expected to hold at least 32 bytes (256 bits).
// - It is the callers responsibility to provide an output buffer that
//   is large enough to hold the expected amount of bytes returned by the
//   chosen hash export declare function.
//
// # Parameters
//
// - `inputPtr`: the pointer into the linear memory where the input
//                data is placed.
// - `inputSize`: the length of the input data in bytes.
// - `outputPtr`: the pointer into the linear memory where the output
//                 data is placed. The export declare function will write the result
//                 directly into this buffer.
// @ts-ignore
@external("seal0", "seal_hash_sha2_256")
export declare function seal_hash_sha2_256(
    inputPtr: Ptr,
    inputSize: Size,
    outputPtr: Ptr
): void;

// Computes the KECCAK 256-bit hash on the given input buffer.
//
// Returns the result directly into the given output buffer.
//
// # Note
//
// - The `input` and `output` buffer may overlap.
// - The output buffer is expected to hold at least 32 bytes (256 bits).
// - It is the callers responsibility to provide an output buffer that
//   is large enough to hold the expected amount of bytes returned by the
//   chosen hash export declare function.
//
// # Parameters
//
// - `inputPtr`: the pointer into the linear memory where the input
//                data is placed.
// - `inputSize`: the length of the input data in bytes.
// - `outputPtr`: the pointer into the linear memory where the output
//                 data is placed. The export declare function will write the result
//                 directly into this buffer.
// @ts-ignore
@external("seal0", "seal_hash_keccak_256")
export declare function seal_hash_keccak_256(
    inputPtr: Ptr,
    inputSize: Size,
    outputPtr: Ptr
): void;

// Computes the BLAKE2 256-bit hash on the given input buffer.
//
// Returns the result directly into the given output buffer.
//
// # Note
//
// - The `input` and `output` buffer may overlap.
// - The output buffer is expected to hold at least 32 bytes (256 bits).
// - It is the callers responsibility to provide an output buffer that
//   is large enough to hold the expected amount of bytes returned by the
//   chosen hash export declare function.
//
// # Parameters
//
// - `inputPtr`: the pointer into the linear memory where the input
//                data is placed.
// - `inputSize`: the length of the input data in bytes.
// - `outputPtr`: the pointer into the linear memory where the output
//                 data is placed. The export declare function will write the result
//                 directly into this buffer.
// @ts-ignore
@external("seal0", "seal_hash_blake2_256")
export declare function seal_hash_blake2_256(
    inputPtr: Ptr,
    inputSize: Size,
    outputPtr: Ptr
): void;

// Computes the BLAKE2 128-bit hash on the given input buffer.
//
// Returns the result directly into the given output buffer.
//
// # Note
//
// - The `input` and `output` buffer may overlap.
// - The output buffer is expected to hold at least 16 bytes (128 bits).
// - It is the callers responsibility to provide an output buffer that
//   is large enough to hold the expected amount of bytes returned by the
//   chosen hash export declare function.
//
// # Parameters
//
// - `inputPtr`: the pointer into the linear memory where the input
//                data is placed.
// - `inputSize`: the length of the input data in bytes.
// - `outputPtr`: the pointer into the linear memory where the output
//                 data is placed. The export declare function will write the result
//                 directly into this buffer.
// @ts-ignore
@external("seal0", "seal_hash_blake2_128")
export declare function seal_hash_blake2_128(
    inputPtr: Ptr,
    inputSize: Size,
    outputPtr: Ptr
): void;

// Call into the chain extension provided by the chain if any.
//
// Handling of the input values is up to the specific chain extension and so is the
// return value. The extension can decide to use the inputs as primitive inputs or as
// in/out arguments by interpreting them as pointers. Any caller of this function
// must therefore coordinate with the chain that it targets.
//
// # Note
//
// If no chain extension exists the contract will trap with the `NoChainExtension`
// module error.
// @ts-ignore
@external("seal0", "seal_call_chain_extension")
export declare function seal_call_chain_extension(
    func_id: u32,
    input_ptr: Ptr,
    input_len: u32,
    output_ptr: Ptr,
    output_len_ptr: Ptr
): u32;


// Emit a custom debug message.
//
// No newlines are added to the supplied message.
// Specifying invalid UTF-8 triggers a trap.
//
// This is a no-op if debug message recording is disabled which is always the case
// when the code is executing on-chain. The message is interpreted as UTF-8 and
// appended to the debug buffer which is then supplied to the calling RPC client.
//
// # Note
//
// Even though no action is taken when debug message recording is disabled there is still
// a non trivial overhead (and weight cost) associated with calling this function. Contract
// languages should remove calls to this function (either at runtime or compile time) when
// not being executed as an RPC. For example, they could allow users to disable logging
// through compile time flags (cargo features) for on-chain deployment. Additionally, the
// return value of this function can be cached in order to prevent further calls at runtime.
// @ts-ignore
@external("seal0", "seal_debug_message")
export declare function seal_debug_message(strPtr: Ptr, strLen: Size): ReturnCode;


// Call some dispatchable of the runtime.
//
// This function decodes the passed in data as the overarching `Call` type of the
// runtime and dispatches it. The weight as specified in the runtime is charged
// from the gas meter. Any weight refunds made by the dispatchable are considered.
//
// The filter specified by `Config::CallFilter` is attached to the origin of
// the dispatched call.
//
// # Parameters
//
// - `input_ptr`: the pointer into the linear memory where the input data is placed.
// - `input_len`: the length of the input data in bytes.
//
// # Return Value
//
// Returns `ReturnCode::Success` when the dispatchable was succesfully executed and
// returned `Ok`. When the dispatchable was exeuted but returned an error
// `ReturnCode::CallRuntimeReturnedError` is returned. The full error is not
// provided because it is not guaranteed to be stable.
//
// # Comparison with `ChainExtension`
//
// Just as a chain extension this API allows the runtime to extend the functionality
// of contracts. While making use of this function is generelly easier it cannot be
// used in call cases. Consider writing a chain extension if you need to do perform
// one of the following tasks:
//
// - Return data.
// - Provide functionality **exclusively** to contracts.
// - Provide custom weights.
// - Avoid the need to keep the `Call` data structure stable.
//
// # Unstable
//
// This function is unstable and subject to change (or removal) in the future. Do not
// deploy a contract using it to a production chain.

// @ts-ignore
@external("seal0", "seal_ecdsa_recover")
export declare function seal_ecdsa_recover(callPtr: Ptr, callLen: Size): ReturnCode;

// Calculates Ethereum address from the ECDSA compressed public key and stores
// it into the supplied buffer.
//
// # Parameters
//
// - `key_ptr`: a pointer to the ECDSA compressed public key. Should be decodable as a 33 bytes value.
//		Traps otherwise.
// - `out_ptr`: the pointer into the linear memory where the output
//                 data is placed. The function will write the result
//                 directly into this buffer.
//
// The value is stored to linear memory at the address pointed to by `out_ptr`.
// If the available space at `out_ptr` is less than the size of the value a trap is triggered.
//
// # Errors
//
// `ReturnCode::EcdsaRecoverFailed`

// @ts-ignore
@external("seal0", "seal_ecdsa_to_eth_address")
export declare function seal_ecdsa_to_eth_address(keyPtr: Ptr, outPtr: Ptr): ReturnCode;


// Checks whether there is a value stored under the given key.
//
// # Parameters
//
// - `key_ptr`: pointer into the linear memory where the key of the requested value is placed.
//
// # Return Value
//
// Returns the size of the pre-existing value at the specified key if any. Otherwise
// `SENTINEL` is returned as a sentinel value.
// @ts-ignore
@external("seal0", "seal_set_storage")
export declare function seal_contains_storage(
    keyPtr: Ptr,
): Size;
