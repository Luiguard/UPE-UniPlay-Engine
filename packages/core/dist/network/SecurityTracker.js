import { createHmac } from 'crypto';
/**
 * SecurityTracker — Real replay-attack prevention and HMAC signature verification.
 *
 * Uses HMAC-SHA256 for packet integrity verification.
 * Each client is assigned a shared secret on connection (exchanged via TLS handshake).
 */
export class SecurityTracker {
    clientSequences = new Map();
    clientSecrets = new Map();
    /**
     * Register a client with a shared secret (generated server-side on connection).
     */
    registerClient(clientId, sharedSecret) {
        this.clientSequences.set(clientId, 0);
        // Generate a random secret if none provided
        const secret = sharedSecret || this.generateSecret();
        this.clientSecrets.set(clientId, secret);
    }
    getClientSecret(clientId) {
        return this.clientSecrets.get(clientId);
    }
    /**
     * Verify sequence numbers to prevent Replay Attacks.
     * Returns false and drops the packet if the sequence is not strictly monotonic.
     */
    verifySequence(clientId, sequenceNumber) {
        const currentSeq = this.clientSequences.get(clientId) || 0;
        if (sequenceNumber <= currentSeq) {
            console.warn(`[!SECURITY] Dropped Replay Attack from ${clientId} (Seq: ${sequenceNumber}, Expected: >${currentSeq})`);
            return false;
        }
        this.clientSequences.set(clientId, sequenceNumber);
        return true;
    }
    /**
     * Create an HMAC-SHA256 signature for an outgoing payload.
     */
    sign(clientId, payload) {
        const secret = this.clientSecrets.get(clientId);
        if (!secret)
            throw new Error(`No secret registered for client ${clientId}`);
        return createHmac('sha256', secret).update(payload).digest('hex');
    }
    /**
     * Verify an HMAC-SHA256 signature on an incoming payload.
     * Returns true only if the signature matches the payload + client's shared secret.
     */
    verifySignature(clientId, payload, signature) {
        const secret = this.clientSecrets.get(clientId);
        if (!secret) {
            console.warn(`[!SECURITY] No secret found for client ${clientId}`);
            return false;
        }
        const expectedSig = createHmac('sha256', secret).update(payload).digest('hex');
        // Constant-time comparison to prevent timing attacks
        if (expectedSig.length !== signature.length)
            return false;
        let mismatch = 0;
        for (let i = 0; i < expectedSig.length; i++) {
            mismatch |= expectedSig.charCodeAt(i) ^ signature.charCodeAt(i);
        }
        if (mismatch !== 0) {
            console.warn(`[!SECURITY] Invalid HMAC signature from ${clientId}`);
            return false;
        }
        return true;
    }
    removeClient(clientId) {
        this.clientSequences.delete(clientId);
        this.clientSecrets.delete(clientId);
    }
    generateSecret() {
        // Generate 32 random hex characters
        const bytes = new Uint8Array(16);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }
}
//# sourceMappingURL=SecurityTracker.js.map