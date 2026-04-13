import { UniPlayClient, InputFrame } from '@uniplay/client';
import { EventEmitter } from 'events';
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
export declare class PacketProxy extends EventEmitter {
    private localPort;
    private uniPlayClient;
    private localServer;
    private activeGameClient;
    constructor(uniPlayClient: UniPlayClient, localPort: number);
    start(): void;
    private interceptGamePacket;
    private injectStateIntoGame;
    protected decodeNativePacket(buffer: Buffer): Omit<InputFrame, 'tick' | 'timestamp'> | null;
    protected encodeNativeSnapshotPacket(entityId: string, position: {
        x: number;
        y: number;
        z: number;
    }): Buffer;
}
//# sourceMappingURL=PacketProxy.d.ts.map