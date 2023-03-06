import * as seal0 from "./seal0";
import * as seal1 from "./seal1";
import * as seal2 from "./seal2";
export { seal0, seal1, seal2 };

export type Ptr = u32;
export type Size = u32;

/// Every error that can be returned to a contract when it calls any of the host functions.
///
/// # Note
///
/// This enum can be extended in the future: New codes can be added but existing codes
/// will not be changed or removed. This means that any contract **must not** exhaustively
/// match return codes. Instead, contracts should prepare for unknown variants and deal with
/// those errors gracefully in order to be forward compatible.
export enum ReturnCode {
	/// API call successful.
	Success = 0,
	/// The called function trapped and has its state changes reverted.
	/// In this case no output buffer is returned.
	CalleeTrapped = 1,
	/// The called function ran to completion but decided to revert its state.
	/// An output buffer is returned when one was supplied.
	CalleeReverted = 2,
	/// The passed key does not exist in storage.
	KeyNotFound = 3,
	/// See [`Error::TransferFailed`].
	TransferFailed = 5,
	/// No code could be found at the supplied code hash.
	CodeNotFound = 7,
	/// The contract that was called is no contract (a plain account).
	NotCallable = 8,
	/// The call dispatched by `seal_call_runtime` was executed but returned an error.
	CallRuntimeFailed = 10,
	/// ECDSA pubkey recovery failed (most probably wrong recovery id or signature), or
	/// ECDSA compressed pubkey conversion into Ethereum address failed (most probably
	/// wrong pubkey provided).
	EcdsaRecoverFailed = 11,
}
