import { Tick } from '../types.js';

export interface Transport {
  /** Connect to the remote endpoint */
  connect?(url: string): Promise<void>;
  
  /** Disconnect from the remote endpoint */
  disconnect(): void;
  
  /** Send message over the transport (channel semantics may vary) */
  send(channel: string, data: Uint8Array): void;
  
  /** Register message handler */
  onMessage(channel: string, handler: (data: Uint8Array) => void): void;
  
  /** Get current ping in ms */
  getPing(): number;
  
  /** Get network jitter in ms */
  getJitter(): number;
  
  /** Get packet loss percentage (0.0 to 1.0) */
  getPacketLoss(): number;
}
