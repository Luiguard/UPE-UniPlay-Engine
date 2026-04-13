import * as http from 'http';
import { ClientID } from '@uniplay/core';

export class WebhookEmitter {
  private targetUrl: string;

  constructor(targetWebhookUrl: string) {
    this.targetUrl = targetWebhookUrl;
  }

  public emit(eventTopic: string, payload: any): void {
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
  public notifyCheatDetected(clientId: ClientID, points: number, reason: string): void {
    this.emit('cheat_detected', {
      clientId,
      strikePoints: points,
      reason
    });
  }

  public notifyQuorumFailed(taskId: string): void {
    this.emit('quorum_failed', { taskId });
  }
}
