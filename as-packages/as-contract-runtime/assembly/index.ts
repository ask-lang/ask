import * as seal0 from "./seal0";
import * as seal1 from "./seal1";
import * as unstable from "./unstable";
export { seal0, seal1, unstable };

export type Ptr = u32;
export type Size = u32;

/// Every error that can be returned to a contract when it calls any of the host functions.
///
/// # Note
///
/// This enum can be extended in the future: New codes can be added but existing codes
/// will not be changed or removed. This means that any contract **must not** exhaustively
/// match return codes. Instead, contracts should prepare for unknown variants and deal with
/// those errors gracefuly in order to be forward compatible.
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
	/// Deprecated and no longer returned: There is only the minimum balance.
	_BelowSubsistenceThreshold = 4,
	/// See [`Error::TransferFailed`].
	TransferFailed = 5,
	/// Deprecated and no longer returned: Endowment is no longer required.
	_EndowmentTooLow = 6,
	/// No code could be found at the supplied code hash.
	CodeNotFound = 7,
	/// The contract that was called is no contract (a plain account).
	NotCallable = 8,
	/// The call to `seal_debug_message` had no effect because debug message
	/// recording was disabled.
	LoggingDisabled = 9,
    /** unstable **/
	/// The call dispatched by `seal_call_runtime` was executed but returned an error.
	CallRuntimeReturnedError = 10,
    /** unstable **/
	/// ECDSA pubkey recovery failed. Most probably wrong recovery id or signature.
	EcdsaRecoverFailed = 11,
}
