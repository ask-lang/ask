// @ts-nocheck
import { Ptr, ReturnCode, Size } from ".";

/// Set the value at the given key in the contract storage.
///
/// This version is to be used with a fixed sized storage key. For runtimes supporting
/// transparent hashing, please use the newer version of this function.
///
/// The value length must not exceed the maximum defined by the contracts module parameters.
/// Specifying a `value_len` of zero will store an empty value.
///
/// # Parameters
///
/// - `key_ptr`: pointer into the linear memory where the location to store the value is placed.
/// - `value_ptr`: pointer into the linear memory where the value to set is placed.
/// - `value_len`: the length of the value in bytes.
///
/// # Return Value
///
/// Returns the size of the pre-existing value at the specified key if any. Otherwise
/// `SENTINEL` is returned as a sentinel value.
@external("seal1", "set_storage")
export declare function set_storage(
    keyPtr: Ptr,
    valuePtr: Ptr,
    valueSize: Size
): u32;

/// Clear the value at the given key in the contract storage.
///
/// # Parameters
///
/// - `key_ptr`: pointer into the linear memory where the key is placed.
/// - `key_len`: the length of the key in bytes.
///
/// # Return Value
///
/// Returns the size of the pre-existing value at the specified key if any. Otherwise
/// `SENTINEL` is returned as a sentinel value.
@external("seal1", "clear_storage")
export declare function clear_storage(
    keyPtr: Ptr,
    keySize: Size
): u32;

/// Retrieve the value under the given key from storage.
///
/// This version is to be used with a fixed sized storage key. For runtimes supporting
/// transparent hashing, please use the newer version of this function.
///
/// The key length must not exceed the maximum defined by the contracts module parameter.
///
/// # Parameters
///
/// - `key_ptr`: pointer into the linear memory where the key of the requested value is placed.
/// - `key_len`: the length of the key in bytes.
/// - `out_ptr`: pointer to the linear memory where the value is written to.
/// - `out_len_ptr`: in-out pointer into linear memory where the buffer length is read from and
///   the value length is written to.
///
/// # Errors
///
/// - `ReturnCode::KeyNotFound`
@external("seal1", "get_storage")
export declare function get_storage(
    keyPtr: Ptr,
    keySize: Size,
    outPtr: Ptr,
    outPtrLen: Size
): u32;


/// Checks whether there is a value stored under the given key.
///
/// The key length must not exceed the maximum defined by the contracts module parameter.
///
/// # Parameters
///
/// - `key_ptr`: pointer into the linear memory where the key of the requested value is placed.
/// - `key_len`: the length of the key in bytes.
///
/// # Return Value
///
/// Returns the size of the pre-existing value at the specified key if any. Otherwise
/// `SENTINEL` is returned as a sentinel value.
@external("seal1", "contains_storage")
export declare function contains_storage(
    keyPtr: Ptr,
    keySize: Size,
): u32;

/// Instantiate a contract with the specified code hash.
///
/// This function creates an account and executes the constructor defined in the code specified
/// by the code hash. The address of this new account is copied to `address_ptr` and its length
/// to `address_len_ptr`. The constructors output buffer is copied to `output_ptr` and its
/// length to `output_len_ptr`. The copy of the output buffer and address can be skipped by
/// supplying the sentinel value of `SENTINEL` to `output_ptr` or `address_ptr`.
///
/// `value` must be at least the minimum balance. Otherwise the instantiation fails and the
/// contract is not created.
///
/// # Parameters
///
/// - `code_hash_ptr`: a pointer to the buffer that contains the initializer code.
/// - `gas`: how much gas to devote to the execution of the initializer code.
/// - `value_ptr`: a pointer to the buffer with value, how much value to send. Should be
///   decodable as a `T::Balance`. Traps otherwise.
/// - `input_data_ptr`: a pointer to a buffer to be used as input data to the initializer code.
/// - `input_data_len`: length of the input data buffer.
/// - `address_ptr`: a pointer where the new account's address is copied to.
/// - `address_len_ptr`: in-out pointer to where the length of the buffer is read from and the
///   actual length is written to.
/// - `output_ptr`: a pointer where the output buffer is copied to.
/// - `output_len_ptr`: in-out pointer to where the length of the buffer is read from and the
///   actual length is written to.
/// - `salt_ptr`: Pointer to raw bytes used for address derivation. See `fn contract_address`.
/// - `salt_len`: length in bytes of the supplied salt.
///
/// # Errors
///
/// Please consult the `ReturnCode` enum declaration for more information on those
/// errors. Here we only note things specific to this function.
///
/// An error means that the account wasn't created and no address or output buffer
/// is returned unless stated otherwise.
///
/// - `ReturnCode::CalleeReverted`: Output buffer is returned.
/// - `ReturnCode::CalleeTrapped`
/// - `ReturnCode::TransferFailed`
/// - `ReturnCode::CodeNotFound`
@external("seal1", "instantiate")
export declare function instantiate(
    codeHashPtr: Ptr,
    gas: u64,
    valuePtr: Ptr,
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
// This function never returns. Either the termination was successful and the
// execution of the destroyed contract is halted. Or it failed during the termination
// which is considered fatal and results in a trap + rollback.
//
// - beneficiary_ptr: a pointer to the address of the beneficiary account where all
//   where all remaining funds of the caller are transferred.
//   Should be decodable as an `T::AccountId`. Traps otherwise.
//
// # Traps
//
// - The contract is live i.e is already on the call stack.
// - Failed to send the balance to the beneficiary.
// - The deletion queue is full.
@external("seal1", "terminate")
export declare function terminate(beneficiaryPtr: Ptr): void;

/// Make a call to another contract.
///
/// The callees output buffer is copied to `output_ptr` and its length to `output_len_ptr`.
/// The copy of the output buffer can be skipped by supplying the sentinel value
/// of `SENTINEL` to `output_ptr`.
///
/// # Parameters
///
/// - `flags`: See `crate::wasm::runtime::CallFlags` for a documenation of the supported flags.
/// - `callee_ptr`: a pointer to the address of the callee contract. Should be decodable as an
///   `T::AccountId`. Traps otherwise.
/// - `gas`: how much gas to devote to the execution.
/// - `value_ptr`: a pointer to the buffer with value, how much value to send. Should be
///   decodable as a `T::Balance`. Traps otherwise.
/// - `input_data_ptr`: a pointer to a buffer to be used as input data to the callee.
/// - `input_data_len`: length of the input data buffer.
/// - `output_ptr`: a pointer where the output buffer is copied to.
/// - `output_len_ptr`: in-out pointer to where the length of the buffer is read from and the
///   actual length is written to.
///
/// # Errors
///
/// An error means that the call wasn't successful output buffer is returned unless
/// stated otherwise.
///
/// - `ReturnCode::CalleeReverted`: Output buffer is returned.
/// - `ReturnCode::CalleeTrapped`
/// - `ReturnCode::TransferFailed`
/// - `ReturnCode::NotCallable`
@external("seal1", "call")
export declare function call(
    flags: u32,
    calleePtr: Ptr,
    gas: u64,
    valuePtr: Ptr,
    inputDataPtr: Ptr,
    inputDataSize: Size,
    outputPtr: Ptr,
    outputLenPtr: Ptr
): ReturnCode;