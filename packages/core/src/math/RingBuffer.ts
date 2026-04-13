/**
 * A fixed-size ring buffer for efficient frame storage.
 * Used for Input Buffer, Jitter Buffer, and Snapshot history.
 */
export class RingBuffer<T> {
  private buffer: (T | undefined)[];
  private capacity: number;
  private head: number = 0;
  private count: number = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array(capacity).fill(undefined);
  }

  public push(item: T): void {
    const index = (this.head + this.count) % this.capacity;
    this.buffer[index] = item;
    
    if (this.count < this.capacity) {
      this.count++;
    } else {
      // Overwrite oldest item
      this.head = (this.head + 1) % this.capacity;
    }
  }

  public pop(): T | undefined {
    if (this.isEmpty()) return undefined;
    
    // Return newest item
    const index = (this.head + this.count - 1) % this.capacity;
    const item = this.buffer[index];
    this.count--;
    return item;
  }

  public shift(): T | undefined {
    if (this.isEmpty()) return undefined;
    
    // Return oldest item
    const item = this.buffer[this.head];
    this.head = (this.head + 1) % this.capacity;
    this.count--;
    return item;
  }

  public peekNewest(): T | undefined {
    if (this.isEmpty()) return undefined;
    const index = (this.head + this.count - 1) % this.capacity;
    return this.buffer[index];
  }

  public peekOldest(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.buffer[this.head];
  }

  public get(index: number): T | undefined {
    if (index >= this.count || index < 0) return undefined;
    return this.buffer[(this.head + index) % this.capacity];
  }

  public toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.count; i++) {
        const item = this.get(i);
        if (item !== undefined) result.push(item);
    }
    return result;
  }

  public clear(): void {
    this.head = 0;
    this.count = 0;
    for (let i = 0; i < this.capacity; i++) {
      this.buffer[i] = undefined;
    }
  }

  public getCount(): number {
    return this.count;
  }

  public getCapacity(): number {
    return this.capacity;
  }

  public isEmpty(): boolean {
    return this.count === 0;
  }

  public isFull(): boolean {
    return this.count === this.capacity;
  }
}
