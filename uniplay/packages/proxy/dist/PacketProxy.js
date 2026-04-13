import { EventEmitter } from 'events';
import * as net from 'net';
/**
 * Universal PacketProxy
 *
 * Strategy for games like Vanilla Minecraft, Terraria, or Emulators.
 *
 * Works by intercepting local TCP/UDP traffic. The actual game connects
 * to "localhost:localPort" instead of the remote server. The PacketProxy
 * then translates the proprietary network packets into UniPlay Microtasks
 * and Consensus structure.
 */
export class PacketProxy extends EventEmitter {
    localPort;
    uniPlayClient;
    localServer = null;
    activeGameClient = null;
    constructor(uniPlayClient, localPort) {
        super();
        this.uniPlayClient = uniPlayClient;
        this.localPort = localPort;
        // Bridge UniPlay Consensus Result -> Game Packets
        this.uniPlayClient.transport.registerHandler(0x02 /* STATE_UPDATE */, (payload) => {
            this.injectStateIntoGame(payload);
        });
    }
    start() {
        this.localServer = net.createServer((socket) => {
            console.log("[PacketProxy] Game Engine connected locally!");
            this.activeGameClient = socket;
            socket.on('data', (buffer) => {
                this.interceptGamePacket(buffer);
            });
            socket.on('close', () => {
                console.log("[PacketProxy] Game Engine disconnected.");
                this.activeGameClient = null;
            });
        });
        this.localServer.listen(this.localPort, () => {
            console.log(`[PacketProxy] Listening on localhost:${this.localPort} (Tell your game to connect here)`);
        });
    }
    interceptGamePacket(buffer) {
        // Here, users of the SDK will implement a protocol parser for their specific game.
        // e.g. if (isMovementPacket(buffer)) { ... }
        const decodedInput = this.decodeNativePacket(buffer);
        if (decodedInput) {
            // Forward natively into UniPlay System!
            this.uniPlayClient.sendInput(decodedInput);
        }
        else {
            // Drop it, or log it
        }
    }
    injectStateIntoGame(uniPlaySnapshot) {
        if (!this.activeGameClient)
            return;
        // UniPlay reached consensus that a player should be at X, Y, Z.
        // We must forge a network packet for the game to believe the "official server" 
        // sent an EntityTeleport packet.
        for (const entity of uniPlaySnapshot.entities) {
            const fakePacket = this.encodeNativeSnapshotPacket(entity.entityId, entity.position);
            this.activeGameClient.write(fakePacket);
        }
    }
    // --- Provided by SDK User via overrides ---
    decodeNativePacket(buffer) {
        // Abstract mechanism to be implemented per-game
        return null;
    }
    encodeNativeSnapshotPacket(entityId, position) {
        // Abstract mechanism to be implemented per-game
        return Buffer.alloc(0);
    }
}
//# sourceMappingURL=PacketProxy.js.map