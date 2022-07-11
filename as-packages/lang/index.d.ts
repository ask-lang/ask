/* eslint-disable @typescript-eslint/no-explicit-any */

/** Annotates an type declaration be a env type which could be configurable. */
declare function envType(...args: unknown[]): any;

/** Annotates an class that implement SpreadLayout. */
declare function spreadLayout(...args: unknown[]): any;

/** Annotates an class that implement PackedLayout. */
declare function packedLayout(...args: unknown[]): any;

/** Annotates an class as Event class. */
declare function event(config: {
    /**
     * Set the id for the Event class
     */
    id: u32;
}): any;

/** Annotates an field of Event class as topic field. */
declare function topic(...args: unknown[]): any;

/** Annotates an class as topics slass. */
declare function eventTopics(...args: unknown[]): any;

/** Annotates an class as contract class. */
declare function contract(...args: unknown[]): any;

/** Annotates an function of contract class as message function. */
declare function message(config?: {
    /**
     * Set the payable of the message function, the default is false.
     */
    payable?: boolean;
    /**
     * Set the mutates of the message function, the default is false.
     * If false, the function cannot change the storage.
     */
    mutates?: boolean;
    /**
     * Choose a selector for current function, the default is the first 4 bytes of the blake2 operation result of the function name.
     */
    selector?: string;
}): any;

/** Annotates an function of contract class as constructor function. */
declare function constructor(config?: {
    /**
     * Choose a selector for current function, the default is the first 4 bytes of the blake2 operation result of the function name.
     */
    selector?: string;
}): any;
