import * as http from 'http';
/**
 * HostGateway
 *
 * REST API for the Host Game Engine (Spigot, UE Dedicated Server, Godot, etc.)
 * to register zones and entities in the UniPlay State Anchor.
 *
 * Avoids circular imports by accepting individual component references.
 */
export class HostGateway {
    stateAnchor;
    zoneManager;
    tickController;
    httpServer;
    constructor(stateAnchor, zoneManager, tickController, internalPort = 3001) {
        this.stateAnchor = stateAnchor;
        this.zoneManager = zoneManager;
        this.tickController = tickController;
        this.httpServer = http.createServer((req, res) => this.handleRequest(req, res));
        this.httpServer.listen(internalPort, () => {
            console.log(`[HostGateway] IPC API listening on local port ${internalPort}`);
        });
    }
    handleRequest(req, res) {
        // CORS headers for local IPC
        res.setHeader('Content-Type', 'application/json');
        if (req.method === 'POST' && req.url === '/api/v1/zones') {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    this.zoneManager.registerZone(data);
                    res.writeHead(200);
                    res.end(JSON.stringify({ status: 'zone_created', id: data.id }));
                }
                catch (e) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
            return;
        }
        if (req.method === 'POST' && req.url === '/api/v1/entities') {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    this.stateAnchor.write(data.entityId, {
                        entityId: data.entityId,
                        position: data.position || { x: 0, y: 0, z: 0 },
                        velocity: data.velocity || { x: 0, y: 0, z: 0 },
                        rotation: data.rotation || 0,
                        flags: data.flags || 0,
                        objectState: data.objectState || 0,
                        tick: this.tickController.getCurrentTick(),
                        zoneId: data.zoneId || 'default',
                        health: data.health || 100
                    });
                    res.writeHead(200);
                    res.end(JSON.stringify({ status: 'entity_anchored', entityId: data.entityId }));
                }
                catch (e) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
            return;
        }
        if (req.method === 'GET' && req.url === '/api/v1/health') {
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'ok', tick: this.tickController.getCurrentTick() }));
            return;
        }
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
}
//# sourceMappingURL=HostGateway.js.map