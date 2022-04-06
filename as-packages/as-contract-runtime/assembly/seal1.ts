import { Ptr, ReturnCode, Size } from ".";

// Stores a random number for the current block and the given subject into the supplied buffer.
//
// The value is stored to linear memory at the address pointed to by `out_ptr`.
// `out_len_ptr` must point to a u32 value that describes the available space at
// `out_ptr`. This call overwrites it with the size of the value. If the available
// space at `out_ptr` is less than the size of the value a trap is triggered.
//
// The data is encoded as (T::Hash, T::BlockNumber).
//
// # Changes from v0
//
// In addition to the seed it returns the block number since which it was determinable
// by chain observers.
//
// # Note
//
// The returned seed should only be used to distinguish commitments made before
// the returned block number. If the block number is too early (i.e. commitments were
// made afterwards), then ensure no further commitments may be made and repeatedly
// call this on later blocks until the block number returned is later than the latest
// commitment.
// @ts-ignore
@external("seal1", "seal_random")
export declare function seal_random(
    subjectPtr: Ptr,
    subjectSize: Size,
    outPtr: Ptr,
    outLenPtr: Ptr
): void;

// Load the latest block timestamp into the supplied buffer
//
// The value is stored to linear memory at the address pointed to by `out_ptr`.
// `out_len_ptr` must point to a u32 value that describes the available space at
// `out_ptr`. This call overwrites it with the size of the value. If the available
// space at `out_ptr` is less than the size of the value a trap is triggered.
// @ts-ignore
@external("seal1", "seal_now")
export declare function seal_now(
    outPtr: Ptr,
    outLenPtr: Ptr
): void;

// Deprecated
// @ts-ignore
@external("seal1", "seal_restore_to")
export declare function seal_restore_to(
    DestPtr: Ptr,
    codeHashPtr: Ptr,
    rentAllowancePtr: Ptr,
    deltaPtr: Ptr,
    deltaCount: Ptr,
): void;

// Deprecated
// @ts-ignore
@external("seal1", "seal_set_rent_allowance")
export declare function seal_set_rent_allowance(
    valuePtr: Ptr,
): void;


// Instantiate a contract with the specified code hash.
//
// This function creates an account and executes the constructor defined in the code specified
// by the code hash. The address of this new account is copied to `address_ptr` and its length
// to `address_len_ptr`. The constructors output buffer is copied to `output_ptr` and its
// length to `output_len_ptr`. The copy of the output buffer and address can be skipped by
// supplying the sentinel value of `u32::MAX` to `output_ptr` or `address_ptr`.
//
// After running the constructor it is verified that the contract account holds at
// least the subsistence threshold. If that is not the case the instantiation fails and
// the contract is not created.
//
// # Parameters
//
// - code_hash_ptr: a pointer to the buffer that contains the initializer code.
// - gas: how much gas to devote to the execution of the initializer code.
// - value_ptr: a pointer to the buffer with value, how much value to send.
//   Should be decodable as a `T::Balance`. Traps otherwise.
// - input_data_ptr: a pointer to a buffer to be used as input data to the initializer code.
// - input_data_len: length of the input data buffer.
// - address_ptr: a pointer where the new account's address is copied to.
// - address_len_ptr: in-out pointer to where the length of the buffer is read from
//		and the actual length is written to.
// - output_ptr: a pointer where the output buffer is copied to.
// - output_len_ptr: in-out pointer to where the length of the buffer is read from
//   and the actual length is written to.
// - salt_ptr: Pointer to raw bytes used for address derivation. See `fn contract_address`.
// - salt_len: length in bytes of the supplied salt.
//
// # Errors
//
// Please consult the `ReturnCode` enum declaration for more information on those
// errors. Here we only note things specific to this function.
//
// An error means that the account wasn't created and no address or output buffer
// is returned unless stated otherwise.
//
// `ReturnCode::CalleeReverted`: Output buffer is returned.
// `ReturnCode::CalleeTrapped`
// `ReturnCode::BelowSubsistenceThreshold`
// `ReturnCode::TransferFailed`
// `ReturnCode::NewContractNotFunded`
// `ReturnCode::CodeNotFound`
// @ts-ignore
@external("seal1", "seal_instantiate")
export declare function seal_instantiate(
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
// @ts-ignore
@external("seal1", "seal_terminate")
export declare function seal_terminate(
    beneficiaryPtr: Ptr,
): void;