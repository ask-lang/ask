import { IKey } from "../interfaces";
import { pushPackedRoot, clearPackedRoot, pullPackedRoot } from "./packed";

export * from "./packed";
export * from "./spread";

export function forwardPullPacked<T, K extends IKey>(key: K): T {
    // @ts-ignore
    return pullPackedRoot<T, K>(++key);
}

export function forwardPushPacked<T, K extends IKey>(data: T, key: K): void {
    // @ts-ignore
    pushPackedRoot<T, K>(data, ++key);
}

export function forwardClearPacked<T, K extends IKey>(data: T, key: K): void {
    // @ts-ignore
    clearPackedRoot<T, K>(data, ++key);
}
