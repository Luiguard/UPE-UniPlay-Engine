import { Transport, MessageType } from '@uniplay/core';
export declare class WSClientTransport implements Transport {
    private ws;
    private messageHandlers;
    private ping;
    private jitter;
    private pings;
    onConnect: (() => void) | null;
    onDisconnect: (() => void) | null;
    connect(url: string): Promise<void>;
    disconnect(): void;
    send(channel: string, data: Uint8Array): void;
    sendPacket(type: MessageType, payload: any): void;
    onMessage(channel: string, handler: (data: Uint8Array) => void): void;
    registerHandler(type: MessageType, handler: (payload: any) => void): void;
    getPing(): number;
    getJitter(): number;
    getPacketLoss(): number;
    updatePing(rtt: number): void;
}
//# sourceMappingURL=WebSocketClientTransport.d.ts.map