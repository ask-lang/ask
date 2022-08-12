/**
 * Ask! transform version, it should keep same with package.json
 */
export const ASK_VERSION = "0.4.0-rc2";
/**
 * LANG_LIB represents a generated namespace for `ask-lang` to use.
 */
export const LANG_LIB = "__lang";
/**
 * LANG_LIB_PATH represents the path of `ask-lang` package.
 */
export const LANG_LIB_PATH = "ask-lang";

/** The followings are interface types */
export const IEVENT_TYPE_PATH = "__lang.IEvent";
export const SPREAD_LAYOUT_TYPE_PATH = "__lang.SpreadLayout";
export const PACKED_LAYOUT_TYPE_PATH = "__lang.PackedLayout";
export const IKEY_TYPE_PATH = "__lang.IKey";
export const ICONTRACT_TYPE_PATH = "__lang.IContract";
export const IMESSAGE_TYPE_PATH = "__lang.IMessage";

export const KEY_TYPE_PATH = "__lang.Key";
export const DENY_PAYMENT_CALL = "__lang.denyPayment<Balance>()";

/**
 * Ask config file. Path is set by environment variable, default to cwd.
 */
export const CONFIG_NAME = "askconfig.json";
