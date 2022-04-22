/**
 * IEvent represents a contract event.
 *
 * A class implement IEvent should also can do (de)serialize.
 */
export interface IEvent {
    /**
     * It represents a event id.
     *
     * Note: u32 is not compatible with ink!. Maybe we should use u8.
     */
    eventId(): u32;

    // TODO: support topics
    // eventTopics<T extends ISerialize>(): T;
}
