export class WSClientTransport {
    ws = null;
    messageHandlers = new Map();
    ping = 0;
    jitter = 0;
    pings = [];
    onConnect = null;
    onDisconnect = null;
    async connect(url) {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(url);
            this.ws.onopen = () => {
                if (this.onConnect)
                    this.onConnect();
                resolve();
            };
            this.ws.onerror = (err) => {
                reject(err);
            };
            this.ws.onclose = () => {
                if (this.onDisconnect)
                    this.onDisconnect();
            };
            this.ws.onmessage = async (event) => {
                let msgStr;
                // Handle Blob if browser environment
                if (typeof Blob !== 'undefined' && event.data instanceof Blob) {
                    msgStr = await event.data.text();
                }
                else {
                    msgStr = event.data.toString();
                }
                try {
                    const packet = JSON.parse(msgStr);
                    const handler = this.messageHandlers.get(packet.type);
                    if (handler) {
                        handler(packet.payload);
                    }
                }
                catch (e) {
                    console.error("Failed to parse packet", e);
                }
            };
        });
    }
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
    send(channel, data) {
        // We ignore channel here and use WebSocket text for the skeleton
        // The `sendPacket` method takes care of actual formatting
    }
    sendPacket(type, payload) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN)
            return;
        this.ws.send(JSON.stringify({ type, payload }));
    }
    onMessage(channel, handler) {
        // Unused in basic setup without channels
    }
    registerHandler(type, handler) {
        this.messageHandlers.set(type, handler);
    }
    getPing() {
        return this.ping;
    }
    getJitter() {
        return this.jitter;
    }
    getPacketLoss() {
        return 0; // Requires sequence number tracking
    }
    // Call this when processing heartbeats to calculate ping/jitter
    updatePing(rtt) {
        this.pings.push(rtt);
        if (this.pings.length > 10)
            this.pings.shift();
        let sum = 0;
        for (let p of this.pings)
            sum += p;
        this.ping = sum / this.pings.length;
        // Simple jitter math (variance of recent pings)
        let variance = 0;
        for (let p of this.pings)
            variance += Math.abs(p - this.ping);
        this.jitter = variance / this.pings.length;
    }
}
//# sourceMappingURL=WebSocketClientTransport.js.map