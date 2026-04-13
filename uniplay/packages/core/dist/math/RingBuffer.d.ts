/**
 * A fixed-size ring buffer for efficient frame storage.
 * Used for Input Buffer, Jitter Buffer, and Snapshot history.
 */
export declare class RingBuffer<T> {
    private buffer;
    private capacity;
    private head;
    private count;
    constructor(capacity: number);
    push(item: T): void;
    pop(): T | undefined;
    shift(): T | undefined;
    peekNewest(): T | undefined;
    peekOldest(): T | undefined;
    get(index: number): T | undefined;
    toArray(): T[];
    clear(): void;
    getCount(): number;
    getCapacity(): number;
    isEmpty(): boolean;
    isFull(): boolean;
}
//# sourceMappingURL=RingBuffer.d.ts.map