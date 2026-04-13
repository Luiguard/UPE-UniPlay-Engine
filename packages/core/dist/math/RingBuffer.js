/**
 * A fixed-size ring buffer for efficient frame storage.
 * Used for Input Buffer, Jitter Buffer, and Snapshot history.
 */
export class RingBuffer {
    buffer;
    capacity;
    head = 0;
    count = 0;
    constructor(capacity) {
        this.capacity = capacity;
        this.buffer = new Array(capacity).fill(undefined);
    }
    push(item) {
        const index = (this.head + this.count) % this.capacity;
        this.buffer[index] = item;
        if (this.count < this.capacity) {
            this.count++;
        }
        else {
            // Overwrite oldest item
            this.head = (this.head + 1) % this.capacity;
        }
    }
    pop() {
        if (this.isEmpty())
            return undefined;
        // Return newest item
        const index = (this.head + this.count - 1) % this.capacity;
        const item = this.buffer[index];
        this.count--;
        return item;
    }
    shift() {
        if (this.isEmpty())
            return undefined;
        // Return oldest item
        const item = this.buffer[this.head];
        this.head = (this.head + 1) % this.capacity;
        this.count--;
        return item;
    }
    peekNewest() {
        if (this.isEmpty())
            return undefined;
        const index = (this.head + this.count - 1) % this.capacity;
        return this.buffer[index];
    }
    peekOldest() {
        if (this.isEmpty())
            return undefined;
        return this.buffer[this.head];
    }
    get(index) {
        if (index >= this.count || index < 0)
            return undefined;
        return this.buffer[(this.head + index) % this.capacity];
    }
    toArray() {
        const result = [];
        for (let i = 0; i < this.count; i++) {
            const item = this.get(i);
            if (item !== undefined)
                result.push(item);
        }
        return result;
    }
    clear() {
        this.head = 0;
        this.count = 0;
        for (let i = 0; i < this.capacity; i++) {
            this.buffer[i] = undefined;
        }
    }
    getCount() {
        return this.count;
    }
    getCapacity() {
        return this.capacity;
    }
    isEmpty() {
        return this.count === 0;
    }
    isFull() {
        return this.count === this.capacity;
    }
}
//# sourceMappingURL=RingBuffer.js.map