import * as http from 'http';
export class WebhookEmitter {
    targetUrl;
    constructor(targetWebhookUrl) {
        this.targetUrl = targetWebhookUrl;
    }
    emit(eventTopic, payload) {
        const dataString = JSON.stringify({
            topic: eventTopic,
            timestamp: Date.now(),
            data: payload
        });
        const url = new URL(this.targetUrl);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': dataString.length
            }
        };
        const req = http.request(options, (res) => {
            // Keep silently acknowledging webhooks unless debugging
        });
        req.on('error', (e) => {
            console.warn(`[WebhookEmitter] Host Server unreachable at ${this.targetUrl}`);
        });
        req.write(dataString);
        req.end();
    }
    // Pre-configured hook for the critical Anti-Cheat interaction
    notifyCheatDetected(clientId, points, reason) {
        this.emit('cheat_detected', {
            clientId,
            strikePoints: points,
            reason
        });
    }
    notifyQuorumFailed(taskId) {
        this.emit('quorum_failed', { taskId });
    }
}
//# sourceMappingURL=WebhookEmitter.js.map