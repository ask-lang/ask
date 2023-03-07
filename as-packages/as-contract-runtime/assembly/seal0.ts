// @ts-nocheck
import { Ptr, ReturnCode, Size } from ".";

// Set the value at the given key in the contract storage.
//
// Equivalent to the newer version of `seal_set_storage` with the exception of the return
// type. Still a valid thing to call when not interested in the return value.
@external("seal0", "set_storage")
export declare function set_storage(
    keyPtr: Ptr,
    valuePtr: Ptr,
    valueSize: Size
): void;

/// Checks whether there is a value stored under the given key.
///
/// This version is to be used with a fixed sized storage key. For runtimes supporting
/// transparent hashing, please use the newer version of this function.
///
/// # Parameters
///
/// - `key_ptr`: pointer into the linear memory where the key of the requested value is placed.
///
/// # Return Value
///
/// Returns the size of the pre-existing value at the specified key if any. Otherwise
/// `SENTINEL` is returned as a sentinel value.
@external("seal0", "contains_storage")
export declare function contains_storage(
    keyPtr: Ptr,
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
@external("seal0", "clear_storage")
export declare function clear_storage(keyPtr: Ptr): void;

/// Retrieve and remove the value under the given key from storage.
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
@external("seal0", "take_storage")
export declare function take_storage(
    keyPtr: Ptr,
    keyLen: Size,
    outPtr: Ptr,
    outLenPtr: Ptr,
): ReturnCode;

/// Retrieve the value under the given key from storage.
///
/// This version is to be used with a fixed sized storage key. For runtimes supporting
/// transparent hashing, please use the newer version of this function.
///
/// # Parameters
///
/// - `key_ptr`: pointer into the linear memory where the key of the requested value is placed.
/// - `out_ptr`: pointer to the linear memory where the value is written to.
/// - `out_len_ptr`: in-out pointer into linear memory where the buffer length is read from and
///   the value length is written to.
///
/// # Errors
///
/// `ReturnCode::KeyNotFound`
@external("seal0", "get_storage")
export declare function get_storage(
    keyPtr: Ptr,
    outPtr: Ptr,
    outSizePtr: Ptr
): ReturnCode;

/// Transfer some value to another account.
///
/// # Parameters
///
/// - `account_ptr`: a pointer to the address of the beneficiary account Should be decodable as
///   an `T::AccountId`. Traps otherwise.
/// - `account_len`: length of the address buffer.
/// - `value_ptr`: a pointer to the buffer with value, how much value to send. Should be
///   decodable as a `T::Balance`. Traps otherwise.
/// - `value_len`: length of the value buffer.
///
/// # Errors
///
/// - `ReturnCode::TransferFailed`
@external("seal0", "transfer")
export declare function transfer(
    accountPtr: Ptr,
    _accountSize: Size,
    valuePtr: Ptr,
    _valueSize: Size
): ReturnCode;

/// Make a call to another contract.
///
/// # New version available
///
/// This is equivalent to calling the newer version of this function with
/// `flags` set to `ALLOW_REENTRY`. See the newer version for documentation.
///
/// # Note
///
/// The values `_callee_len` and `_value_len` are ignored because the encoded sizes
/// of those types are fixed through
/// [`codec::MaxEncodedLen`]. The fields exist
/// for backwards compatibility. Consider switching to the newest version of this function.
@external("seal0", "call")
export declare function call(
    calleePtr: Ptr,
    _calleeSize: Size,
    gas: u64,
    valuePtr: Ptr,
    _valueSize: Size,
    inputDataPtr: Ptr,
    inputDataSize: Size,
    outputPtr: Ptr,
    outputLenPtr: Ptr
): ReturnCode;

/// Execute code in the context (storage, caller, value) of the current contract.
///
/// Reentrancy protection is always disabled since the callee is allowed
/// to modify the callers storage. This makes going through a reentrancy attack
/// unnecessary for the callee when it wants to exploit the caller.
///
/// # Parameters
///
/// - `flags`: see `crate::wasm::runtime::CallFlags` for a documentation of the supported flags.
/// - `code_hash`: a pointer to the hash of the code to be called.
/// - `input_data_ptr`: a pointer to a buffer to be used as input data to the callee.
/// - `input_data_len`: length of the input data buffer.
/// - `output_ptr`: a pointer where the output buffer is copied to.
/// - `output_len_ptr`: in-out pointer to where the length of the buffer is read from and the
///   actual length is written to.
///
/// # Errors
///
/// An error means that the call wasn't successful and no output buffer is returned unless
/// stated otherwise.
///
/// - `ReturnCode::CalleeReverted`: Output buffer is returned.
/// - `ReturnCode::CalleeTrapped`
/// - `ReturnCode::CodeNotFound`
@external("seal0", "delegate_call")
export declare function delegate_call(
    flags: u32,
    code_hash_ptr: Ptr,
    input_data_ptr: Ptr,
    input_data_len: Size,
    output_ptr: Ptr,
    output_len_ptr: Ptr,
): ReturnCode;

/// Instantiate a contract with the specified code hash.
///
/// # New version available
///
/// This is equivalent to calling the newer version of this function. The newer version
/// drops the now unnecessary length fields.
///
/// # Note
///
/// The values `_code_hash_len` and `_value_len` are ignored because the encoded sizes
/// of those types are fixed through
/// [`codec::MaxEncodedLen`]. The fields exist
/// for backwards compatibility. Consider switching to the newest version of this function.
@external("seal0", "instantiate")
export declare function instantiate(
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

/// Remove the calling account and transfer remaining balance.
///
/// # New version available
///
/// This is equivalent to calling the newer version of this function. The newer version
/// drops the now unnecessary length fields.
///
/// # Note
///
/// The value `_beneficiary_len` is ignored because the encoded sizes
/// this type is fixed through `[`MaxEncodedLen`]. The field exist for backwards
/// compatibility. Consider switching to the newest version of this function.
@external("seal0", "terminate")
export declare function terminate(
    beneficiaryPtr: Ptr,
    _beneficiaryLen: Size
): void;

/// Stores the input passed by the caller into the supplied buffer.
///
/// The value is stored to linear memory at the address pointed to by `out_ptr`.
/// `out_len_ptr` must point to a u32 value that describes the available space at
/// `out_ptr`. This call overwrites it with the size of the value. If the available
/// space at `out_ptr` is less than the size of the value a trap is triggered.
///
/// # Note
///
/// This function traps if the input was previously forwarded by a [`call()`][`Self::call()`].
@external("seal0", "input")
export declare function input(bufPtr: Ptr, bufLenPtr: Ptr): void;

/// Cease contract execution and save a data buffer as a result of the execution.
///
/// This function never returns as it stops execution of the caller.
/// This is the only way to return a data buffer to the caller. Returning from
/// execution without calling this function is equivalent to calling:
/// ```nocompile
/// seal_return(0, 0, 0);
/// ```
///
/// The flags argument is a bitfield that can be used to signal special return
/// conditions to the supervisor:
/// --- lsb ---
/// bit 0      : REVERT - Revert all storage changes made by the caller.
/// bit [1, 31]: Reserved for future use.
/// --- msb ---
///
/// Using a reserved bit triggers a trap.
@external("seal0", "seal_return")
export declare function seal_return(
    flags: u32,
    dataPtr: Ptr,
    dataSize: Size
): void;

/// Stores the address of the caller into the supplied buffer.
///
/// The value is stored to linear memory at the address pointed to by `out_ptr`.
/// `out_len_ptr` must point to a u32 value that describes the available space at
/// `out_ptr`. This call overwrites it with the size of the value. If the available
/// space at `out_ptr` is less than the size of the value a trap is triggered.
///
/// If this is a top-level call (i.e. initiated by an extrinsic) the origin address of the
/// extrinsic will be returned. Otherwise, if this call is initiated by another contract then
/// the address of the contract will be returned. The value is encoded as T::AccountId.
@external("seal0", "caller")
export declare function caller(outPtr: Ptr, outLenPtr: Ptr): void;


/// Checks whether a specified address belongs to a contract.
///
/// # Parameters
///
/// - `account_ptr`: a pointer to the address of the beneficiary account Should be decodable as
///   an `T::AccountId`. Traps otherwise.
///
/// Returned value is a `u32`-encoded boolean: (0 = false, 1 = true).
@external("seal0", "is_contract")
export declare function is_contract(accountPtr: Ptr): u32;

/// Retrieve the code hash for a specified contract address.
///
/// # Parameters
///
/// - `account_ptr`: a pointer to the address in question. Should be decodable as an
///   `T::AccountId`. Traps otherwise.
/// - `out_ptr`: pointer to the linear memory where the returning value is written to.
/// - `out_len_ptr`: in-out pointer into linear memory where the buffer length is read from and
///   the value length is written to.
///
/// # Errors
///
/// - `ReturnCode::KeyNotFound`
@external("seal0", "code_hash")
export declare function code_hash(accountPtr: Ptr, outPtr: Ptr, outLenPtr: Ptr): ReturnCode;

/// Retrieve the code hash of the currently executing contract.
///
/// # Parameters
///
/// - `out_ptr`: pointer to the linear memory where the returning value is written to.
/// - `out_len_ptr`: in-out pointer into linear memory where the buffer length is read from and
///   the value length is written to.
@external("seal0", "own_code_hash")
export declare function own_code_hash(accountPtr: Ptr, outLenPtr: Ptr): void;

/// Checks whether the caller of the current contract is the origin of the whole call stack.
///
/// Prefer this over [`is_contract()`][`Self::is_contract`] when checking whether your contract
/// is being called by a contract or a plain account. The reason is that it performs better
/// since it does not need to do any storage lookups.
///
/// A return value of `true` indicates that this contract is being called by a plain account
/// and `false` indicates that the caller is another contract.
///
/// Returned value is a `u32`-encoded boolean: (`0 = false`, `1 = true`).
@external("seal0", "caller_is_origin")
export declare function caller_is_origin(): u32;

/// Replace the contract code at the specified address with new code.
///
/// # Note
///
/// There are a couple of important considerations which must be taken into account when
/// using this API:
///
/// 1. The storage at the code address will remain untouched. This means that contract
/// developers must ensure that the storage layout of the new code is compatible with that of
/// the old code.
///
/// 2. Contracts using this API can't be assumed as having deterministic addresses. Said another
/// way, when using this API you lose the guarantee that an address always identifies a specific
/// code hash.
///
/// 3. If a contract calls into itself after changing its code the new call would use
/// the new code. However, if the original caller panics after returning from the sub call it
/// would revert the changes made by [`set_code_hash()`][`Self::set_code_hash`] and the next
/// caller would use the old code.
///
/// # Parameters
///
/// - `code_hash_ptr`: A pointer to the buffer that contains the new code hash.
///
/// # Errors
///
/// - `ReturnCode::CodeNotFound`
@external("seal0", "set_code_hash")
export declare function set_code_hash(codeHashPtr: Ptr): u32;

/// Stores the address of the current contract into the supplied buffer.
///
/// The value is stored to linear memory at the address pointed to by `out_ptr`.
/// `out_len_ptr` must point to a u32 value that describes the available space at
/// `out_ptr`. This call overwrites it with the size of the value. If the available
/// space at `out_ptr` is less than the size of the value a trap is triggered.
@external("seal0", "address")
export declare function address(outPtr: Ptr, outLenPtr: Ptr): void;

/// Stores the price for the specified amount of gas into the supplied buffer.
///
/// The value is stored to linear memory at the address pointed to by `out_ptr`.
/// `out_len_ptr` must point to a u32 value that describes the available space at
/// `out_ptr`. This call overwrites it with the size of the value. If the available
/// space at `out_ptr` is less than the size of the value a trap is triggered.
///
/// The data is encoded as `T::Balance`.
///
/// # Note
///
/// It is recommended to avoid specifying very small values for `gas` as the prices for a single
/// gas can be smaller than one.
@external("seal0", "weight_to_fee")
export declare function weight_to_fee(
    gas: u64,
    outPtr: Ptr,
    outLenPtr: Ptr
): void;

/// Stores the amount of gas left into the supplied buffer.
///
/// The value is stored to linear memory at the address pointed to by `outPtr`.
/// `outLenPtr` must point to a u32 value that describes the available space at
/// `outPtr`. This call overwrites it with the size of the value. If the available
/// space at `outPtr` is less than the size of the value a trap is triggered.
///
/// The data is encoded as Gas.
@external("seal0", "gas_left")
export declare function gas_left(outPtr: Ptr, outLenPtr: Ptr): void;

/// Stores the balance of the current account into the supplied buffer.
///
/// The value is stored to linear memory at the address pointed to by `outPtr`.
/// `outLenPtr` must point to a u32 value that describes the available space at
/// `outPtr`. This call overwrites it with the size of the value. If the available
/// space at `outPtr` is less than the size of the value a trap is triggered.
///
/// The data is encoded as T::Balance.
@external("seal0", "balance")
export declare function balance(outPtr: Ptr, outLenPtr: Ptr): void;

/// Stores the value transferred along with this call or as endowment into the supplied buffer.
///
/// The value is stored to linear memory at the address pointed to by `outPtr`.
/// `outLenPtr` must point to a u32 value that describes the available space at
/// `outPtr`. This call overwrites it with the size of the value. If the available
/// space at `outPtr` is less than the size of the value a trap is triggered.
///
/// The data is encoded as T::Balance.
@external("seal0", "value_transferred")
export declare function value_transferred(outPtr: Ptr, outLenPtr: Ptr): void;

/// Load the latest block timestamp into the supplied buffer
///
/// The value is stored to linear memory at the address pointed to by `outPtr`.
/// `outLenPtr` must point to a u32 value that describes the available space at
/// `outPtr`. This call overwrites it with the size of the value. If the available
/// space at `outPtr` is less than the size of the value a trap is triggered.
@external("seal0", "now")
export declare function now(outPtr: Ptr, outLenPtr: Ptr): void;

/// Stores the minimum balance (a.k.a. existential deposit) into the supplied buffer.
///
/// The data is encoded as `T::Balance`.
@external("seal0", "minimum_balance")
export declare function minimum_balance(outPtr: Ptr, outLenPtr: Ptr): void;

/// Deposit a contract event with the data buffer and optional list of topics. There is a limit
/// on the maximum number of topics specified by `event_topics`.
///
/// - `topics_ptr`: a pointer to the buffer of topics encoded as `Vec<T::Hash>`. The value of
///   this is ignored if `topics_len` is set to `0`. The topics list can't contain duplicates.
/// - `topics_len`:  the length of the topics buffer. Pass 0 if you want to pass an empty
///   vector.
/// - `data_ptr`: a pointer to a raw data buffer which will saved along the event.
/// - `data_len`:  the length of the data buffer.
@external("seal0", "deposit_event")
export declare function deposit_event(
    topicsPtr: Ptr,
    topicsLen: Size,
    dataPtr: Ptr,
    dataLen: Size
): void;


/// Stores the current block number of the current contract into the supplied buffer.
///
/// The value is stored to linear memory at the address pointed to by `out_ptr`.
/// `out_len_ptr` must point to a u32 value that describes the available space at
/// `out_ptr`. This call overwrites it with the size of the value. If the available
/// space at `out_ptr` is less than the size of the value a trap is triggered.
@external("seal0", "block_number")
export declare function block_number(outPtr: Ptr, outLenPtr: Ptr): void;

/// Computes the SHA2 256-bit hash on the given input buffer.
///
/// Returns the result directly into the given output buffer.
///
/// # Note
///
/// - The `input` and `output` buffer may overlap.
/// - The output buffer is expected to hold at least 32 bytes (256 bits).
/// - It is the callers responsibility to provide an output buffer that is large enough to hold
///   the expected amount of bytes returned by the chosen hash function.
///
/// # Parameters
///
/// - `input_ptr`: the pointer into the linear memory where the input data is placed.
/// - `input_len`: the length of the input data in bytes.
/// - `output_ptr`: the pointer into the linear memory where the output data is placed. The
///   function will write the result directly into this buffer.
@external("seal0", "hash_sha2_256")
export declare function hash_sha2_256(
    inputPtr: Ptr,
    inputSize: Size,
    outputPtr: Ptr
): void;

/// Computes the KECCAK 256-bit hash on the given input buffer.
///
/// Returns the result directly into the given output buffer.
///
/// # Note
///
/// - The `input` and `output` buffer may overlap.
/// - The output buffer is expected to hold at least 32 bytes (256 bits).
/// - It is the callers responsibility to provide an output buffer that is large enough to hold
///   the expected amount of bytes returned by the chosen hash function.
///
/// # Parameters
///
/// - `input_ptr`: the pointer into the linear memory where the input data is placed.
/// - `input_len`: the length of the input data in bytes.
/// - `output_ptr`: the pointer into the linear memory where the output data is placed. The
///   function will write the result directly into this buffer.
@external("seal0", "hash_keccak_256")
export declare function hash_keccak_256(
    inputPtr: Ptr,
    inputSize: Size,
    outputPtr: Ptr
): void;

/// Computes the BLAKE2 256-bit hash on the given input buffer.
///
/// Returns the result directly into the given output buffer.
///
/// # Note
///
/// - The `input` and `output` buffer may overlap.
/// - The output buffer is expected to hold at least 32 bytes (256 bits).
/// - It is the callers responsibility to provide an output buffer that is large enough to hold
///   the expected amount of bytes returned by the chosen hash function.
///
/// # Parameters
///
/// - `input_ptr`: the pointer into the linear memory where the input data is placed.
/// - `input_len`: the length of the input data in bytes.
/// - `output_ptr`: the pointer into the linear memory where the output data is placed. The
///   function will write the result directly into this buffer.
@external("seal0", "hash_blake2_256")
export declare function hash_blake2_256(
    inputPtr: Ptr,
    inputSize: Size,
    outputPtr: Ptr
): void;

/// Computes the BLAKE2 128-bit hash on the given input buffer.
///
/// Returns the result directly into the given output buffer.
///
/// # Note
///
/// - The `input` and `output` buffer may overlap.
/// - The output buffer is expected to hold at least 16 bytes (128 bits).
/// - It is the callers responsibility to provide an output buffer that is large enough to hold
///   the expected amount of bytes returned by the chosen hash function.
///
/// # Parameters
///
/// - `input_ptr`: the pointer into the linear memory where the input data is placed.
/// - `input_len`: the length of the input data in bytes.
/// - `output_ptr`: the pointer into the linear memory where the output data is placed. The
///   function will write the result directly into this buffer.
@external("seal0", "hash_blake2_128")
export declare function hash_blake2_128(
    inputPtr: Ptr,
    inputSize: Size,
    outputPtr: Ptr
): void;

/// Call into the chain extension provided by the chain if any.
///
/// Handling of the input values is up to the specific chain extension and so is the
/// return value. The extension can decide to use the inputs as primitive inputs or as
/// in/out arguments by interpreting them as pointers. Any caller of this function
/// must therefore coordinate with the chain that it targets.
///
/// # Note
///
/// If no chain extension exists the contract will trap with the `NoChainExtension`
/// module error.
@external("seal0", "call_chain_extension")
export declare function call_chain_extension(
    id: u32,
    input_ptr: Ptr,
    input_len: u32,
    output_ptr: Ptr,
    output_len_ptr: Ptr
): u32;


/// Emit a custom debug message.
///
/// No newlines are added to the supplied message.
/// Specifying invalid UTF-8 just drops the message with no trap.
///
/// This is a no-op if debug message recording is disabled which is always the case
/// when the code is executing on-chain. The message is interpreted as UTF-8 and
/// appended to the debug buffer which is then supplied to the calling RPC client.
///
/// # Note
///
/// Even though no action is taken when debug message recording is disabled there is still
/// a non trivial overhead (and weight cost) associated with calling this function. Contract
/// languages should remove calls to this function (either at runtime or compile time) when
/// not being executed as an RPC. For example, they could allow users to disable logging
/// through compile time flags (cargo features) for on-chain deployment. Additionally, the
/// return value of this function can be cached in order to prevent further calls at runtime.
@external("seal0", "debug_message")
export declare function debug_message(strPtr: Ptr, strLen: Size): ReturnCode;

/// Recovers the ECDSA public key from the given message hash and signature.
///
/// Writes the public key into the given output buffer.
/// Assumes the secp256k1 curve.
///
/// # Parameters
///
/// - `signature_ptr`: the pointer into the linear memory where the signature is placed. Should
///   be decodable as a 65 bytes. Traps otherwise.
/// - `message_hash_ptr`: the pointer into the linear memory where the message hash is placed.
///   Should be decodable as a 32 bytes. Traps otherwise.
/// - `output_ptr`: the pointer into the linear memory where the output data is placed. The
///   buffer should be 33 bytes. The function will write the result directly into this buffer.
///
/// # Errors
///
/// - `ReturnCode::EcdsaRecoverFailed`
@external("seal0", "ecdsa_recover")
export declare function ecdsa_recover(
    signaturePtr: Ptr,
    message_hashPtr: Ptr,
    outputPtr: Ptr,
    ): ReturnCode;

/// Calculates Ethereum address from the ECDSA compressed public key and stores
/// it into the supplied buffer.
///
/// # Parameters
///
/// - `key_ptr`: a pointer to the ECDSA compressed public key. Should be decodable as a 33 bytes
///   value. Traps otherwise.
/// - `out_ptr`: the pointer into the linear memory where the output data is placed. The
///   function will write the result directly into this buffer.
///
/// The value is stored to linear memory at the address pointed to by `out_ptr`.
/// If the available space at `out_ptr` is less than the size of the value a trap is triggered.
///
/// # Errors
///
/// - `ReturnCode::EcdsaRecoverFailed`
@external("seal0", "ecdsa_to_eth_address")
export declare function ecdsa_to_eth_address(keyPtr: Ptr, outPtr: Ptr): ReturnCode;
