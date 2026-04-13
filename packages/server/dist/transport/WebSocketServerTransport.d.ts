import { MessageType, ClientID } from '@uniplay/core';
export declare class WSTransportServer {
    private wss;
    private clients;
    private messageHandlers;
    onClientConnect: ((clientId: ClientID) => void) | null;
    onClientDisconnect: ((clientId: ClientID) => void) | null;
    constructor(port: number);
    registerHandler(type: MessageType, handler: (clientId: ClientID, payload: any) => void): void;
    sendTo(clientId: ClientID, type: MessageType, payload: any): void;
    broadcast(type: MessageType, payload: any): void;
    private generateClientId;
    close(): void;
}
//# sourceMappingURL=WebSocketServerTransport.d.ts.map