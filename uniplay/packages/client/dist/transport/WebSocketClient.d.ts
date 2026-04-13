import { NetworkMessage } from '@uniplay/core';
export declare class WebSocketClient {
    private ws;
    constructor(serverUrl: string, clientId: string);
    sendMessage(message: NetworkMessage): void;
    private handleMessage;
}
//# sourceMappingURL=WebSocketClient.d.ts.map