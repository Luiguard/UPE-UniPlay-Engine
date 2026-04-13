import { ClientID } from '../types.js';
/**
 * SecurityTracker — Real replay-attack prevention and HMAC signature verification.
 *
 * Uses HMAC-SHA256 for packet integrity verification.
 * Each client is assigned a shared secret on connection (exchanged via TLS handshake).
 */
export declare class SecurityTracker {
    private clientSequences;
    private clientSecrets;
    /**
     * Register a client with a shared secret (generated server-side on connection).
     */
    registerClient(clientId: ClientID, sharedSecret?: string): void;
    getClientSecret(clientId: ClientID): string | undefined;
    /**
     * Verify sequence numbers to prevent Replay Attacks.
     * Returns false and drops the packet if the sequence is not strictly monotonic.
     */
    verifySequence(clientId: ClientID, sequenceNumber: number): boolean;
    /**
     * Create an HMAC-SHA256 signature for an outgoing payload.
     */
    sign(clientId: ClientID, payload: string): string;
    /**
     * Verify an HMAC-SHA256 signature on an incoming payload.
     * Returns true only if the signature matches the payload + client's shared secret.
     */
    verifySignature(clientId: ClientID, payload: string, signature: string): boolean;
    removeClient(clientId: ClientID): void;
    private generateSecret;
}
//# sourceMappingURL=SecurityTracker.d.ts.map