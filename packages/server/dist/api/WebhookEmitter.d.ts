import { ClientID } from '@uniplay/core';
export declare class WebhookEmitter {
    private targetUrl;
    constructor(targetWebhookUrl: string);
    emit(eventTopic: string, payload: any): void;
    notifyCheatDetected(clientId: ClientID, points: number, reason: string): void;
    notifyQuorumFailed(taskId: string): void;
}
//# sourceMappingURL=WebhookEmitter.d.ts.map