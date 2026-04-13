import { NetworkMessage } from '@uniplay/core';
export declare class WebSocketServer {
    private wss;
    private clients;
    constructor(port: number);
    sendToClient(clientId: string, message: NetworkMessage): void;
    broadcast(message: NetworkMessage): void;
    private handleMessage;
}
//# sourceMappingURL=WebSocketServer.d.ts.map