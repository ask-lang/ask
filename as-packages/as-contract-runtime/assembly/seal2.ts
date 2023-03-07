// @ts-nocheck
import { Ptr, Size } from ".";

/// Set the value at the given key in the contract storage.
///
/// The key and value lengths must not exceed the maximums defined by the contracts module
/// parameters. Specifying a `value_len` of zero will store an empty value.
///
/// # Parameters
///
/// - `key_ptr`: pointer into the linear memory where the location to store the value is placed.
/// - `key_len`: the length of the key in bytes.
/// - `value_ptr`: pointer into the linear memory where the value to set is placed.
/// - `value_len`: the length of the value in bytes.
///
/// # Return Value
///
/// Returns the size of the pre-existing value at the specified key if any. Otherwise
/// `SENTINEL` is returned as a sentinel value.
@external("seal2", "set_storage")
export declare function set_storage(
    keyPtr: Ptr,
    keyLen: Size,
    valuePtr: Ptr,
    valueSize: Size
): u32;
