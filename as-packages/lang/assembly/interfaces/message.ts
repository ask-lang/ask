/**
 * IMessage can determine a selector for a meesage input and decode arguments from input.
 */
export interface IMessage {
    /**
     * Determine whether the message is the call of the selector
     * @param selector 4 Bytes array
     * @returns
     */
    isSelector(selector: StaticArray<u8>): bool;

    /**
     * Consume part of message bytes and return the decoded type value
     * @returns arg value
     */
    getArg<T>(): T;
}
