import { Ptr, Size, ReturnCode } from ".";

// Retrieve and remove the value under the given key from storage.
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
@external("__unstable__", "seal_take_storage")
export declare function seal_take_storage(
    keyPtr: Ptr,
    outPtr: Ptr,
    outLenPtr: Ptr,
): ReturnCode;

// Clear the value at the given key in the contract storage.
//
// # Parameters
//
// - `key_ptr`: pointer into the linear memory where the location to clear the value is placed.
//
// # Return Value
//
// Returns the size of the pre-existing value at the specified key if any. Otherwise
// `SENTINEL` is returned as a sentinel value.
// @ts-ignore
@external("__unstable__", "seal_clear_storage")
export declare function seal_clear_storage(keyPtr: Ptr): Size;

// Make a call to another contract.
//
// The callees output buffer is copied to `output_ptr` and its length to `output_len_ptr`.
// The copy of the output buffer can be skipped by supplying the sentinel value
// of `u32::MAX` to `output_ptr`.
//
// # Parameters
//
// - flags: See [`CallFlags`] for a documenation of the supported flags.
// - callee_ptr: a pointer to the address of the callee contract.
//   Should be decodable as an `T::AccountId`. Traps otherwise.
// - gas: how much gas to devote to the execution.
// - value_ptr: a pointer to the buffer with value, how much value to send.
//   Should be decodable as a `T::Balance`. Traps otherwise.
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
@external("__unstable__", "seal_call")
export declare function seal_call(flags: u32, calleePtr: Ptr, gas: u64, valuePtr: Ptr, inputDataPtr: Ptr, inputDataLen: Size, outputPtr: Ptr, outputLenPtr: Ptr): ReturnCode;

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
@external("__unstable__", "seal_call_runtime")
export declare function seal_call_runtime(callPtr: Ptr, callLen: Size): ReturnCode;
