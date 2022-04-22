import { IMessage } from ".";

/**
 * IContract represents a callable and deployable class which will be used as a substrate contract instance.
 */
export interface IContract {
    /**
     * Deploy a contract according to message. It will be called by main deploy function.
     * @param message 
     */
    deploy<M extends IMessage>(message: M): i32;

    /**
     * Call a contract message function according to message. It will be called by main call function.
     * @param message 
     */
    call<M extends IMessage>(message: M): i32;
}
