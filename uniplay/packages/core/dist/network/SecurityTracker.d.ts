import { ClientID } from '../types.js';
export declare class SecurityTracker {
    private clientSequences;
    /**
     * Verify sequence numbers to prevent Replay Attacks
     */
    verifySequence(clientId: ClientID, sequenceNumber: number): boolean;
    /**
     * Enterprise ECDSA Signature Verification
     * In a real environment, you'd use node:crypto or window.crypto.subtle
     */
    verifySignature(clientId: ClientID, payload: any, signature: string, publicKey: string): boolean;
}
//# sourceMappingURL=SecurityTracker.d.ts.map